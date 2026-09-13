/**
 * Şehir veritabanı üretici.
 *
 * Kaynaklar:
 *   - all-the-cities        (GeoNames cities1000 türevi: ad, nüfus, koordinat)
 *   - country-state-city    (Türkiye'nin 81 ili ve ~1.350 ilçesi — GeoNames'te
 *                            PPL olarak bulunmayan Kadıköy, Beşiktaş vb. için)
 *   - @photostructure/tz-lookup (koordinat → IANA saat dilimi)
 *
 * Çıktı: src/data/cities.json (kompakt dizi formatı, uygulamaya gömülür)
 *
 * Seçim kuralı:
 *   - Türkiye'deki TÜM yerleşimler + tüm ilçeler
 *   - Dünya genelinde nüfusu >= 15.000 olan yerleşimler
 *   - Tüm başkentler ve il/eyalet merkezleri (PPLC / PPLA)
 *
 * Çalıştırma:  node scripts/build-cities.mjs
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const allCities = require('all-the-cities');
const csc = require('country-state-city');
const tzLookup = require('@photostructure/tz-lookup');

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/cities.json');

const MIN_WORLD_POP = 15000;

// GeoNames'teki bazı TR yer adları hatalı/eski transliterasyon — düzeltilir
const TR_NAME_FIXES = {
  Istanbul: 'İstanbul',
  Gumushkhane: 'Gümüşhane',
  Khanjarah: 'Çankırı',
};

// GeoNames'te il merkezi adı ile il adı farklı olan TR illeri
const TR_PROVINCE_OVERRIDES = {
  İzmit: 'Kocaeli',
  Adapazarı: 'Sakarya',
  Antakya: 'Hatay',
};

/** Türkçe duyarlı normalize (arama anahtarı) */
function norm(s) {
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .trim();
}

/* ------------------------------------------------------------------ */
/* 1) Türkiye il adları ve il merkezi nüfusları (GeoNames adminCode → il) */
/* ------------------------------------------------------------------ */
const trProvinceByAdmin = new Map();
const provinceCapitalPop = new Map(); // il adı → merkez nüfusu
for (const c of allCities) {
  if (c.country !== 'TR') continue;
  if (c.featureCode === 'PPLA' || c.featureCode === 'PPLC') {
    const fixed = TR_NAME_FIXES[c.name] ?? c.name;
    const province = TR_PROVINCE_OVERRIDES[fixed] ?? fixed;
    trProvinceByAdmin.set(c.adminCode, province);
    provinceCapitalPop.set(norm(province), c.population);
  }
}

/* ------------------------------------------------------------------ */
/* 2) Ülke adları (Türkçe) — Node'un tam ICU'su ile                     */
/* ------------------------------------------------------------------ */
const regionNames = new Intl.DisplayNames(['tr'], { type: 'region' });
const countryNames = {};
function countryName(cc) {
  if (!countryNames[cc]) {
    try {
      countryNames[cc] = regionNames.of(cc) ?? cc;
    } catch {
      countryNames[cc] = cc;
    }
  }
  return countryNames[cc];
}

/* ------------------------------------------------------------------ */
/* 3) Saat dilimi indeksi                                               */
/* ------------------------------------------------------------------ */
const tzIndex = new Map();
const tzList = [];
function tzId(lat, lng) {
  let tz;
  try {
    tz = tzLookup(lat, lng);
  } catch {
    tz = 'Etc/UTC';
  }
  if (!tzIndex.has(tz)) {
    tzIndex.set(tz, tzList.length);
    tzList.push(tz);
  }
  return tzIndex.get(tz);
}

/** Sıralama artısı: ilçe olması ve bağlı olduğu ilin büyüklüğü */
function boostFor(isDistrict, province) {
  const capPop = provinceCapitalPop.get(norm(province)) ?? 0;
  return Math.round((isDistrict ? 8 : 0) + (capPop > 0 ? 3 * Math.log10(capPop) : 0));
}

/* ------------------------------------------------------------------ */
/* 4) Kayıtlar                                                          */
/* ------------------------------------------------------------------ */
// [name, lat, lng, cc, tzIndex, admin, population, boost]
const rows = [];
const trSeen = new Map(); // norm(name)|norm(province) → row

for (const c of allCities) {
  const isTR = c.country === 'TR';
  const keep = isTR || c.population >= MIN_WORLD_POP || c.featureCode === 'PPLC' || c.featureCode === 'PPLA';
  if (!keep) continue;
  const [lng, lat] = c.loc.coordinates;
  const name = isTR ? (TR_NAME_FIXES[c.name] ?? c.name) : c.name;
  const admin = isTR ? (trProvinceByAdmin.get(c.adminCode) ?? '') : '';
  countryName(c.country);
  const row = [name, +lat.toFixed(4), +lng.toFixed(4), c.country, tzId(lat, lng), admin, c.population, isTR ? boostFor(false, admin) : 0];
  rows.push(row);
  if (isTR) trSeen.set(`${norm(name)}|${norm(admin)}`, row);
}

// Türkiye ilçeleri (country-state-city). İl adı GeoNames'ten türetilen
// kanonik Türkçe yazımla eşlenir ("Istanbul" → "İstanbul").
const provinceCanonical = new Map([...trProvinceByAdmin.values()].map((n) => [norm(n), n]));
let districtsAdded = 0;
let districtsMerged = 0;
for (const st of csc.State.getStatesOfCountry('TR')) {
  const province = provinceCanonical.get(norm(st.name)) ?? st.name;
  for (const city of csc.City.getCitiesOfState('TR', st.isoCode)) {
    const name = city.name.replace(/\s+(İlçesi|Ilcesi|ilçesi)$/u, '').trim();
    const lat = +city.latitude;
    const lng = +city.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const key = `${norm(name)}|${norm(province)}`;
    const existing = trSeen.get(key);
    if (existing) {
      // GeoNames kaydı var: ilçe artısını ekle
      existing[7] = boostFor(true, province);
      districtsMerged++;
      continue;
    }
    const row = [name, +lat.toFixed(4), +lng.toFixed(4), 'TR', tzId(lat, lng), province, 0, boostFor(true, province)];
    rows.push(row);
    trSeen.set(key, row);
    districtsAdded++;
  }
}

// Nüfusa göre sırala (arama sonuçlarında büyük şehirler önce gelsin)
rows.sort((a, b) => b[6] + b[7] * 1000 - (a[6] + a[7] * 1000));

const out = {
  version: 2,
  generatedAt: new Date().toISOString().slice(0, 10),
  fields: ['name', 'lat', 'lng', 'cc', 'tz', 'admin', 'pop', 'boost'],
  tz: tzList,
  countries: countryNames,
  cities: rows,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));

const trCount = rows.filter((r) => r[3] === 'TR').length;
console.log(
  `Yazıldı: ${OUT}\n  toplam: ${rows.length} yerleşim (TR: ${trCount}; ilçe eklenen ${districtsAdded}, birleşen ${districtsMerged}), ${tzList.length} saat dilimi, ${Object.keys(countryNames).length} ülke, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`,
);
console.log('TR il sayısı:', trProvinceByAdmin.size);
