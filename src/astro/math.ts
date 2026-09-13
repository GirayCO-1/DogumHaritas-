import type { ZodiacPosition } from './types';

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

/** 0 ≤ x < 360 */
export function norm360(x: number): number {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

/** −180 ≤ x < 180 (işaretli fark) */
export function norm180(x: number): number {
  const r = norm360(x);
  return r >= 180 ? r - 360 : r;
}

/** İki boylam arasındaki en kısa açısal uzaklık (0–180) */
export function angularDistance(a: number, b: number): number {
  return Math.abs(norm180(a - b));
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export const sinD = (d: number) => Math.sin(d * DEG);
export const cosD = (d: number) => Math.cos(d * DEG);
export const tanD = (d: number) => Math.tan(d * DEG);
export const asinD = (x: number) => Math.asin(clamp(x, -1, 1)) * RAD;
export const acosD = (x: number) => Math.acos(clamp(x, -1, 1)) * RAD;
export const atanD = (x: number) => Math.atan(x) * RAD;
export const atan2D = (y: number, x: number) => Math.atan2(y, x) * RAD;

/** JS Date (UTC) → Jülyen günü (UT) */
export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/** J2000.0'dan itibaren Jülyen yüzyılı */
export function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

/** Jülyen günü → JS Date */
export function dateFromJulianDay(jd: number): Date {
  return new Date((jd - 2440587.5) * 86400000);
}

/**
 * Ortalama ekliptik eğikliği (Laskar 1986, derece). Yedek olarak kullanılır;
 * asıl hesap astronomy-engine'in gerçek eğikliğiyle yapılır.
 */
export function meanObliquity(jd: number): number {
  const t = julianCenturies(jd);
  const u = t / 100;
  // arcsaniye cinsinden
  const sec =
    84381.448 -
    4680.93 * u -
    1.55 * u ** 2 +
    1999.25 * u ** 3 -
    51.38 * u ** 4 -
    249.67 * u ** 5 -
    39.05 * u ** 6 +
    7.12 * u ** 7 +
    27.87 * u ** 8 +
    5.79 * u ** 9 +
    2.45 * u ** 10;
  return sec / 3600;
}

export interface DMS {
  deg: number;
  min: number;
  sec: number;
}

/** Ondalık dereceyi derece/dakika/saniyeye böler (yuvarlama taşmalarını düzeltir) */
export function splitDegrees(value: number): DMS {
  const total = Math.round(Math.abs(value) * 3600); // saniye
  const deg = Math.floor(total / 3600);
  const min = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return { deg, min, sec };
}

/** Tropikal boylam → burç, burç içi derece */
export function zodiacPosition(longitude: number): ZodiacPosition {
  const lon = norm360(longitude);
  const sign = Math.floor(lon / 30) % 12;
  const degreeInSign = lon - sign * 30;
  let { deg, min, sec } = splitDegrees(degreeInSign);
  // 29°59'59.6" → 30°00'00" taşması: burç içinde kalsın
  if (deg >= 30) {
    deg = 29;
    min = 59;
    sec = 59;
  }
  return { longitude: lon, sign, degreeInSign, deg, min, sec };
}

/** Ekliptik (λ, β) → ekvatoral (α, δ); ε: eğiklik. Hepsi derece. */
export function eclipticToEquatorial(lon: number, lat: number, eps: number): { ra: number; dec: number } {
  const sl = sinD(lon);
  const cl = cosD(lon);
  const sb = sinD(lat);
  const cb = cosD(lat);
  const tb = cb === 0 ? 0 : sb / cb;
  const se = sinD(eps);
  const ce = cosD(eps);
  const ra = norm360(atan2D(sl * ce - tb * se, cl));
  const dec = asinD(sb * ce + cb * se * sl);
  return { ra, dec };
}

/** Ekvatoral (α, δ) → ekliptik (λ, β) */
export function equatorialToEcliptic(ra: number, dec: number, eps: number): { lon: number; lat: number } {
  const sa = sinD(ra);
  const ca = cosD(ra);
  const sd = sinD(dec);
  const cd = cosD(dec);
  const td = cd === 0 ? 0 : sd / cd;
  const se = sinD(eps);
  const ce = cosD(eps);
  const lon = norm360(atan2D(sa * ce + td * se, ca));
  const lat = asinD(sd * ce - cd * se * sa);
  return { lon, lat };
}

/**
 * Ekvatoral (α, δ) → ufuk (azimut kuzeyden doğuya, yükseklik).
 * lst: yerel yıldız zamanı (derece), phi: gözlemci enlemi.
 */
export function equatorialToHorizontal(
  ra: number,
  dec: number,
  lst: number,
  phi: number,
): { azimuth: number; altitude: number } {
  const h = norm360(lst - ra); // saat açısı
  const sh = sinD(h);
  const ch = cosD(h);
  const sd = sinD(dec);
  const cd = cosD(dec);
  const sp = sinD(phi);
  const cp = cosD(phi);
  const altitude = asinD(sp * sd + cp * cd * ch);
  // Meeus 13.5: azimut güneyden batıya; kuzeyden ölçmek için 180 ekle
  const azSouth = atan2D(sh, ch * sp - (cd === 0 ? 0 : sd / cd) * cp);
  return { azimuth: norm360(azSouth + 180), altitude };
}
