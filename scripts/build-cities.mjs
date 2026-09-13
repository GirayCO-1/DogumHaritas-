/**
 * Şehir veritabanı üretici.
 *
 * Kaynak: all-the-cities (GeoNames cities1000 türevi) + @photostructure/tz-lookup.
 * Çıktı:  src/data/cities.json  (kompakt dizi formatı, uygulamaya gömülür)
 *
 * Seçim kuralı:
 *   - Türkiye'deki TÜM yerleşimler (ilçe düzeyi arama için)
 *   - Dünya genelinde nüfusu >= 15.000 olan yerleşimler
 *   - Tüm başkentler ve il/eyalet merkezleri (PPLC / PPLA)
 *
 * Çalıştırma:  node scripts/build-cities.mjs
 */
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const allCities = require('all-the-cities');
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

// 1) Türkiye il adları: her adminCode için PPLA (il merkezi) kaydının adı
const trProvinceByAdmin = new Map();
for (const c of allCities) {
  if (c.country !== 'TR') continue;
  if (c.featureCode === 'PPLA' || c.featureCode === 'PPLC') {
    const fixed = TR_NAME_FIXES[c.name] ?? c.name;
    trProvinceByAdmin.set(c.adminCode, TR_PROVINCE_OVERRIDES[fixed] ?? fixed);
  }
}

// 2) Ülke adları (Türkçe) — Node'un tam ICU'su ile üretilir, uygulamada Intl'e güvenmeyiz
const regionNames = new Intl.DisplayNames(['tr'], { type: 'region' });
const countryNames = {};

// 3) Kayıtları filtrele
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

const rows = [];
for (const c of allCities) {
  const isTR = c.country === 'TR';
  const keep =
    isTR || c.population >= MIN_WORLD_POP || c.featureCode === 'PPLC' || c.featureCode === 'PPLA';
  if (!keep) continue;
  const [lng, lat] = c.loc.coordinates;
  const admin = isTR ? trProvinceByAdmin.get(c.adminCode) ?? '' : '';
  if (!countryNames[c.country]) {
    try {
      countryNames[c.country] = regionNames.of(c.country) ?? c.country;
    } catch {
      countryNames[c.country] = c.country;
    }
  }
  rows.push([
    isTR ? TR_NAME_FIXES[c.name] ?? c.name : c.name,
    +lat.toFixed(4),
    +lng.toFixed(4),
    c.country,
    tzId(lat, lng),
    admin,
    c.population,
  ]);
}

// Nüfusa göre sırala (arama sonuçlarında büyük şehirler önce gelsin)
rows.sort((a, b) => b[6] - a[6]);

const out = {
  version: 1,
  generatedAt: new Date().toISOString().slice(0, 10),
  // [name, lat, lng, countryCode, tzIndex, adminName, population]
  fields: ['name', 'lat', 'lng', 'cc', 'tz', 'admin', 'pop'],
  tz: tzList,
  countries: countryNames,
  cities: rows,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));

const trCount = rows.filter((r) => r[3] === 'TR').length;
console.log(
  `Yazıldı: ${OUT}\n  toplam: ${rows.length} şehir (TR: ${trCount}), ${tzList.length} saat dilimi, ${Object.keys(countryNames).length} ülke, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`,
);
console.log('TR il sayısı:', trProvinceByAdmin.size, [...trProvinceByAdmin.values()].sort().join(', '));
