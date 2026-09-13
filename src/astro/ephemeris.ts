/**
 * Gök cisimlerinin görünür, jeosantrik, tarihin gerçek ekliptiğine göre
 * (tropikal) boylamları. Ana motor: astronomy-engine (MIT, ±1' hassasiyet).
 * Chiron için derleme zamanında üretilen gömülü tablo kullanılır
 * (scripts/build-chiron.mjs; kaynak Moshier efemerisi).
 */
import * as Astronomy from 'astronomy-engine';

import chironTable from '../data/chiron.json';
import { atan2D, eclipticToEquatorial, julianCenturies, norm360 } from './math';
import type { NodeType, PlanetId } from './types';

export interface RawBody {
  /** Tropikal ekliptik boylam, derece */
  longitude: number;
  /** Ekliptik enlem, derece */
  latitude: number;
  /** Boylam hızı, derece/gün */
  speed: number;
  /** Uzaklık (AU) — fiziksel cisimlerde */
  distance?: number;
  /** Deklinasyon, derece */
  declination: number;
}

const BODY_MAP: Partial<Record<PlanetId, Astronomy.Body>> = {
  sun: Astronomy.Body.Sun,
  moon: Astronomy.Body.Moon,
  mercury: Astronomy.Body.Mercury,
  venus: Astronomy.Body.Venus,
  mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter,
  saturn: Astronomy.Body.Saturn,
  uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune,
  pluto: Astronomy.Body.Pluto,
};

/** Hız hesabı için merkezi fark adımı (gün) */
const SPEED_DT = 1 / 48;

export function makeTime(date: Date): Astronomy.AstroTime {
  return Astronomy.MakeTime(date);
}

/** Tarihin gerçek ekliptik eğikliği (nütasyon dahil), derece */
export function trueObliquity(time: Astronomy.AstroTime): number {
  return Astronomy.e_tilt(time).tobl;
}

/** Greenwich görünür yıldız zamanı, derece */
export function greenwichSiderealTime(time: Astronomy.AstroTime): number {
  return norm360(Astronomy.SiderealTime(time) * 15);
}

/** Yerel yıldız zamanı / RAMC, derece (boylam doğu pozitif) */
export function localSiderealTime(time: Astronomy.AstroTime, lngEast: number): number {
  return norm360(greenwichSiderealTime(time) + lngEast);
}

function eclipticOfDate(body: Astronomy.Body, time: Astronomy.AstroTime) {
  const vec = Astronomy.GeoVector(body, time, true);
  const ecl = Astronomy.Ecliptic(vec);
  return { lon: norm360(ecl.elon), lat: ecl.elat, dist: Math.hypot(vec.x, vec.y, vec.z) };
}

function withSpeed(
  lonAt: (t: Astronomy.AstroTime) => number,
  time: Astronomy.AstroTime,
  dt = SPEED_DT,
): number {
  const before = lonAt(time.AddDays(-dt));
  const after = lonAt(time.AddDays(dt));
  let diff = after - before;
  // 360° sınırını geçen durum
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff / (2 * dt);
}

function finish(lon: number, lat: number, speed: number, eps: number, dist?: number): RawBody {
  const { dec } = eclipticToEquatorial(lon, lat, eps);
  return { longitude: norm360(lon), latitude: lat, speed, distance: dist, declination: dec };
}

/* ------------------------------------------------------------------ */
/* Gezegenler                                                          */
/* ------------------------------------------------------------------ */

export function planetPosition(id: PlanetId, time: Astronomy.AstroTime, eps: number): RawBody {
  const body = BODY_MAP[id];
  if (!body) throw new Error(`planetPosition: ${id} bir gezegen değil`);
  const now = eclipticOfDate(body, time);
  const speed = withSpeed((t) => eclipticOfDate(body, t).lon, time);
  return finish(now.lon, now.lat, speed, eps, now.dist);
}

/* ------------------------------------------------------------------ */
/* Ay düğümleri                                                        */
/* ------------------------------------------------------------------ */

/** Ortalama Kuzey Ay Düğümü (Meeus 47.7) */
export function meanNodeLongitude(time: Astronomy.AstroTime): number {
  const T = julianCenturies(time.ut + 2451545.0); // AstroTime.ut = J2000'den gün
  return norm360(
    125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T ** 3 / 467441 - T ** 4 / 60616000,
  );
}

/**
 * Gerçek (osküle) Kuzey Ay Düğümü: Ay'ın anlık yörünge düzleminin
 * ekliptiği kestiği yükselen nokta. Konum×hız vektöründen bulunur.
 */
export function trueNodeLongitude(time: Astronomy.AstroTime): number {
  const st = Astronomy.GeoMoonState(time);
  const rot = Astronomy.Rotation_EQJ_ECT(time);
  const r = Astronomy.RotateVector(rot, new Astronomy.Vector(st.x, st.y, st.z, time));
  const v = Astronomy.RotateVector(rot, new Astronomy.Vector(st.vx, st.vy, st.vz, time));
  // h = r × v (yörünge açısal momentumu, ekliptik çerçevede)
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  // Yükselen düğüm yönü n = ẑ × h = (−hy, hx, 0) → Ω = atan2(hx, −hy)
  return norm360(atan2D(hx, -hy));
}

export function nodePosition(type: NodeType, time: Astronomy.AstroTime, eps: number): RawBody {
  const fn = type === 'mean' ? meanNodeLongitude : trueNodeLongitude;
  const lon = fn(time);
  const speed = withSpeed(fn, time, type === 'mean' ? 1 : SPEED_DT);
  return finish(lon, 0, speed, eps);
}

/* ------------------------------------------------------------------ */
/* Lilith (ortalama Kara Ay = Ay'ın ortalama apojesi)                  */
/* ------------------------------------------------------------------ */

export function meanLilithLongitude(time: Astronomy.AstroTime): number {
  const T = julianCenturies(time.ut + 2451545.0);
  // Ay'ın ortalama perijesi (Meeus: L' − M') + 180°
  const perigee =
    83.3532465 + 4069.0137287 * T - 0.01032 * T * T - T ** 3 / 80053 + T ** 4 / 18999000;
  return norm360(perigee + 180);
}

export function lilithPosition(time: Astronomy.AstroTime, eps: number): RawBody {
  const lon = meanLilithLongitude(time);
  const speed = withSpeed(meanLilithLongitude, time, 1);
  return finish(lon, 0, speed, eps);
}

/* ------------------------------------------------------------------ */
/* Chiron — gömülü tablo (scripts/build-chiron.mjs) + kübik interpolasyon */
/* ------------------------------------------------------------------ */

interface ChironTable {
  startMs: number;
  stepDays: number;
  /** Uçlardaki yedek örnek sayısı (interpolasyon payı) */
  pad: number;
  count: number;
  /** Sarmalanmamış (sürekli) boylam */
  lon: number[];
  lat: number[];
}

const CHIRON = chironTable as ChironTable;

/** Uniform ızgarada Catmull-Rom interpolasyonu */
function catmullRom(arr: number[], x: number): number {
  const n = arr.length;
  const xi = Math.min(Math.max(x, 0), n - 1.000001);
  const i = Math.floor(xi);
  const u = xi - i;
  const p0 = arr[Math.max(i - 1, 0)];
  const p1 = arr[i];
  const p2 = arr[Math.min(i + 1, n - 1)];
  const p3 = arr[Math.min(i + 2, n - 1)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u)
  );
}

/** Tablonun güvenilir kapsadığı aralık (UTC); dışında uç değer döner */
export const CHIRON_RANGE = {
  start: new Date(CHIRON.startMs + CHIRON.pad * CHIRON.stepDays * 86400000),
  end: new Date(CHIRON.startMs + (CHIRON.count - 1 - CHIRON.pad) * CHIRON.stepDays * 86400000),
};

function chironRaw(time: Astronomy.AstroTime): { lon: number; lat: number } {
  const x = (time.date.getTime() - CHIRON.startMs) / (CHIRON.stepDays * 86400000);
  return { lon: norm360(catmullRom(CHIRON.lon, x)), lat: catmullRom(CHIRON.lat, x) };
}

export function chironPosition(time: Astronomy.AstroTime, eps: number): RawBody {
  const now = chironRaw(time);
  const speed = withSpeed((t) => chironRaw(t).lon, time, 0.5);
  return finish(now.lon, now.lat, speed, eps);
}

/* ------------------------------------------------------------------ */
/* Toplu hesap                                                         */
/* ------------------------------------------------------------------ */

export function computeAllBodies(
  time: Astronomy.AstroTime,
  eps: number,
  nodeType: NodeType = 'true',
): Map<PlanetId, RawBody> {
  const out = new Map<PlanetId, RawBody>();
  for (const id of Object.keys(BODY_MAP) as PlanetId[]) {
    out.set(id, planetPosition(id, time, eps));
  }
  out.set('chiron', chironPosition(time, eps));
  const north = nodePosition(nodeType, time, eps);
  out.set('northNode', north);
  out.set('southNode', finish(north.longitude + 180, 0, north.speed, eps));
  out.set('lilith', lilithPosition(time, eps));
  return out;
}
