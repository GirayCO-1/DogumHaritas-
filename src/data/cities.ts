/**
 * Gömülü şehir veritabanı üzerinde arama.
 * Veri: scripts/build-cities.mjs ile üretilen src/data/cities.json
 */
import raw from './cities.json';

export interface City {
  name: string;
  lat: number;
  lng: number;
  countryCode: string;
  countryName: string;
  timeZone: string;
  /** İl adı (yalnızca Türkiye) */
  admin: string;
  population: number;
  /** Sıralama artısı (ilçe olması, bağlı ilin büyüklüğü) */
  boost: number;
}

interface RawDb {
  version: number;
  tz: string[];
  countries: Record<string, string>;
  /** [name, lat, lng, cc, tzIndex, admin, population, boost] */
  cities: [string, number, number, string, number, string, number, number][];
}

const db = raw as unknown as RawDb;

/** Türkçe karakterleri ve büyük/küçük harfi normalize eder (İ→i, ı→i, ş→s ...) */
export function normalizeText(s: string): string {
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
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .trim();
}

interface Indexed {
  city: City;
  key: string;
  adminKey: string;
  countryKey: string;
}

let index: Indexed[] | null = null;

function buildIndex(): Indexed[] {
  if (index) return index;
  index = db.cities.map(([name, lat, lng, cc, tz, admin, pop, boost]) => {
    const city: City = {
      name,
      lat,
      lng,
      countryCode: cc,
      countryName: db.countries[cc] ?? cc,
      timeZone: db.tz[tz],
      admin,
      population: pop,
      boost: boost ?? 0,
    };
    return {
      city,
      key: normalizeText(name),
      adminKey: normalizeText(admin),
      countryKey: normalizeText(city.countryName),
    };
  });
  return index;
}

export function cityLabel(c: City): string {
  const parts = [c.name];
  if (c.admin && c.admin !== c.name) parts.push(c.admin);
  parts.push(c.countryName);
  return parts.join(', ');
}

/**
 * Şehir arar. Sonuçlar: önce tam ad eşleşmesi, sonra ön ek, sonra içeren;
 * eşitlikte Türkiye ve büyük nüfus önce gelir.
 */
export function searchCities(query: string, limit = 25): City[] {
  const q = normalizeText(query);
  if (q.length < 2) return [];
  const [first, ...rest] = q.split(' ').filter(Boolean);
  const results: { c: City; score: number }[] = [];
  for (const it of buildIndex()) {
    let score = 0;
    if (it.key === q) score = 100;
    else if (it.key.startsWith(q)) score = 80;
    else if (it.key.startsWith(first)) score = 60;
    else if (it.key.includes(first)) score = 40;
    else continue;
    // "kadıköy istanbul" gibi ikinci kelime il/ülkeyle eşleşirse
    if (rest.length) {
      const tail = rest.join(' ');
      if (it.adminKey.startsWith(tail) || it.countryKey.startsWith(tail) || it.key.includes(tail)) score += 15;
      else score -= 25;
    }
    if (it.city.countryCode === 'TR') score += 8;
    score += Math.min(10, Math.log10(Math.max(1, it.city.population))) + it.city.boost;
    results.push({ c: it.city, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((r) => r.c);
}

/** Popüler şehirler (boş arama kutusu için) */
export function popularCities(limit = 12): City[] {
  const tr = buildIndex()
    .filter((i) => i.city.countryCode === 'TR')
    .slice(0, limit)
    .map((i) => i.city);
  return tr;
}

export function cityCount(): number {
  return db.cities.length;
}
