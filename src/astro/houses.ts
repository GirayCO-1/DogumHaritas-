/**
 * Ev sistemleri.
 *
 * Tüm formüller RAMC (yerel yıldız zamanı, derece), ε (ekliptik eğikliği) ve
 * φ (coğrafi enlem) üzerinden çalışır. Kutup bölgelerinde çözülemeyen
 * sistemler Porphyry'ye düşer ve `fallbackFrom` ile işaretlenir.
 */
import { asinD, atan2D, atanD, cosD, norm360, sinD, tanD } from './math';
import type { HouseData, HouseSystem } from './types';

/**
 * "Oblik yükselim" x ve kutup enlemi f için ekliptik boylam.
 * asc1(RAMC + 90, φ) = Yükselen, asc1(RAMC, 0) = MC.
 */
export function asc1(x: number, f: number, eps: number): number {
  const y = sinD(x);
  const xx = cosD(x) * cosD(eps) - tanD(f) * sinD(eps);
  return norm360(atan2D(y, xx));
}

export function ascendant(ramc: number, eps: number, lat: number): number {
  return asc1(ramc + 90, lat, eps);
}

export function midheaven(ramc: number, eps: number): number {
  return norm360(atan2D(sinD(ramc), cosD(ramc) * cosD(eps)));
}

/**
 * Vertex: ana dikey dairenin (prime vertical) ekliptiği batıda kestiği nokta.
 * Ana dikey daire, kutbu ufkun kuzey noktası olan büyük dairedir; bu da
 * "enlemi 90−φ, meridyeni RAMC+180 olan hayali gözlemcinin ufku"dur.
 */
export function vertex(ramc: number, eps: number, lat: number): number {
  const phi = Math.abs(lat) < 1e-4 ? (lat < 0 ? -1e-4 : 1e-4) : lat;
  let v = asc1(ramc + 270, 90 - phi, eps);
  // Formül iki antipodal kesişimden birini döndürür; Vertex tanım gereği
  // ekliptiğin batı yarısındadır (IC → DSC → MC yayı). Değilse 180° çevir.
  const ic = norm360(midheaven(ramc, eps) + 180);
  if (norm360(v - ic) >= 180) v += 180;
  return norm360(v);
}

/** Boylamın hangi evde olduğunu döndürür (1–12). */
export function houseOf(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    const span = norm360(end - start);
    const off = norm360(longitude - start);
    if (off < span) return i + 1;
  }
  return 12;
}

/* ------------------------------------------------------------------ */
/* Sistemler                                                           */
/* ------------------------------------------------------------------ */

function fill(c11: number, c12: number, c2: number, c3: number, asc: number, mc: number): number[] {
  const cusps = new Array<number>(12);
  cusps[0] = asc;
  cusps[1] = c2;
  cusps[2] = c3;
  cusps[3] = norm360(mc + 180);
  cusps[4] = norm360(c11 + 180);
  cusps[5] = norm360(c12 + 180);
  cusps[6] = norm360(asc + 180);
  cusps[7] = norm360(c2 + 180);
  cusps[8] = norm360(c3 + 180);
  cusps[9] = mc;
  cusps[10] = c11;
  cusps[11] = c12;
  return cusps;
}

function equalCusps(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => norm360(asc + 30 * i));
}

function wholeSignCusps(asc: number): number[] {
  const start = Math.floor(norm360(asc) / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => norm360(start + 30 * i));
}

function porphyryCusps(asc: number, mc: number): number[] {
  const q1 = norm360(asc - mc); // MC → ASC yayı
  const ic = norm360(mc + 180);
  const q2 = norm360(ic - asc); // ASC → IC yayı
  const c11 = norm360(mc + q1 / 3);
  const c12 = norm360(mc + (2 * q1) / 3);
  const c2 = norm360(asc + q2 / 3);
  const c3 = norm360(asc + (2 * q2) / 3);
  return fill(c11, c12, c2, c3, asc, mc);
}

/**
 * Placidus: ev başlangıcı, kendi yarı-gündüz/gece yayının 1/3 ya da 2/3'ünü
 * tamamlamış ekliptik noktasıdır. Yükselim farkı noktaya bağlı olduğundan
 * iteratif çözülür.
 */
function placidusCusp(
  ramc: number,
  eps: number,
  lat: number,
  offset: number,
  fraction: number,
): number | null {
  let ra = ramc + offset;
  for (let i = 0; i < 60; i++) {
    const lon = atan2D(sinD(ra), cosD(ra) * cosD(eps));
    const dec = asinD(sinD(eps) * sinD(lon));
    const x = tanD(lat) * tanD(dec);
    if (Math.abs(x) >= 1) return null; // sirkumpolar: çözüm yok
    const ad = asinD(x);
    const next = ramc + offset + fraction * ad;
    const delta = Math.abs(next - ra);
    ra = next;
    if (delta < 1e-7) break;
  }
  return norm360(atan2D(sinD(ra), cosD(ra) * cosD(eps)));
}

function placidusCusps(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] | null {
  const c11 = placidusCusp(ramc, eps, lat, 30, 1 / 3);
  const c12 = placidusCusp(ramc, eps, lat, 60, 2 / 3);
  const c2 = placidusCusp(ramc, eps, lat, 120, 2 / 3);
  const c3 = placidusCusp(ramc, eps, lat, 150, 1 / 3);
  if (c11 === null || c12 === null || c2 === null || c3 === null) return null;
  return fill(c11, c12, c2, c3, asc, mc);
}

/**
 * Koch (doğum yeri sistemi): MC derecesinin yarı-gündüz yayı üçe bölünür,
 * bu anlardaki yükselenler 11. ve 12. ev başlangıçlarıdır.
 */
function kochCusps(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] | null {
  const decMc = asinD(sinD(eps) * sinD(mc));
  const x = tanD(lat) * tanD(decMc);
  if (Math.abs(x) >= 1) return null;
  const k = asinD(x) / 3;
  const c11 = asc1(ramc + 30 - 2 * k, lat, eps);
  const c12 = asc1(ramc + 60 - k, lat, eps);
  const c2 = asc1(ramc + 120 + k, lat, eps);
  const c3 = asc1(ramc + 150 + 2 * k, lat, eps);
  return fill(c11, c12, c2, c3, asc, mc);
}

/** Campanus: ana dikey daire 12 eşit parçaya bölünür. */
function campanusCusps(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] {
  const cusp = (h: number) => asc1(ramc + h, asinD(sinD(lat) * sinD(h)), eps);
  return fill(cusp(30), cusp(60), cusp(120), cusp(150), asc, mc);
}

/** Regiomontanus: gök ekvatoru 12 eşit parçaya bölünür. */
function regiomontanusCusps(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] {
  const cusp = (h: number) => asc1(ramc + h, atanD(tanD(lat) * sinD(h)), eps);
  return fill(cusp(30), cusp(60), cusp(120), cusp(150), asc, mc);
}

/* ------------------------------------------------------------------ */

export function computeHouses(
  system: HouseSystem,
  ramc: number,
  eps: number,
  lat: number,
): HouseData {
  const asc = ascendant(ramc, eps, lat);
  const mc = midheaven(ramc, eps);
  const vtx = vertex(ramc, eps, lat);
  const polar = Math.abs(lat) > 66.0;

  let cusps: number[] | null = null;
  let fallbackFrom: HouseSystem | undefined;

  switch (system) {
    case 'equal':
      cusps = equalCusps(asc);
      break;
    case 'whole':
      cusps = wholeSignCusps(asc);
      break;
    case 'porphyry':
      cusps = porphyryCusps(asc, mc);
      break;
    case 'campanus':
      cusps = polar ? null : campanusCusps(ramc, eps, lat, asc, mc);
      break;
    case 'regiomontanus':
      cusps = polar ? null : regiomontanusCusps(ramc, eps, lat, asc, mc);
      break;
    case 'koch':
      cusps = polar ? null : kochCusps(ramc, eps, lat, asc, mc);
      break;
    case 'placidus':
    default:
      cusps = polar ? null : placidusCusps(ramc, eps, lat, asc, mc);
      break;
  }

  if (!cusps) {
    fallbackFrom = system;
    cusps = porphyryCusps(asc, mc);
  }

  return {
    system: fallbackFrom ? 'porphyry' : system,
    cusps,
    asc,
    mc,
    dsc: norm360(asc + 180),
    ic: norm360(mc + 180),
    vertex: vtx,
    fallbackFrom,
  };
}
