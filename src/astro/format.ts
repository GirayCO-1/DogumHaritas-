import { ASPECTS, BODIES, SIGNS } from './constants';
import { splitDegrees, zodiacPosition } from './math';
import type { Aspect, BodyId, BodyPosition } from './types';

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** 15°32' biçimi (burç içi derece) */
export function formatDegMin(longitude: number, withSeconds = false): string {
  const z = zodiacPosition(longitude);
  return withSeconds ? `${z.deg}°${pad2(z.min)}'${pad2(z.sec)}"` : `${z.deg}°${pad2(z.min)}'`;
}

/** "15°32' Koç" */
export function formatZodiac(longitude: number, withSeconds = false): string {
  const z = zodiacPosition(longitude);
  return `${formatDegMin(longitude, withSeconds)} ${SIGNS[z.sign].name}`;
}

/** "15° Koç 32'" tarzı kısa; sembolle: "15°♈32'" */
export function formatZodiacSymbol(longitude: number): string {
  const z = zodiacPosition(longitude);
  return `${z.deg}°${SIGNS[z.sign].symbol}${pad2(z.min)}'`;
}

/** Mutlak boylam: 123°45'12" */
export function formatAbsolute(longitude: number): string {
  const { deg, min, sec } = splitDegrees(longitude);
  return `${deg}°${pad2(min)}'${pad2(sec)}"`;
}

/** İşaretli derece (deklinasyon, enlem): −12°34' */
export function formatSigned(value: number): string {
  const { deg, min } = splitDegrees(value);
  const s = value < 0 ? '−' : '+';
  return `${s}${deg}°${pad2(min)}'`;
}

export function signName(sign: number): string {
  return SIGNS[((sign % 12) + 12) % 12].name;
}

export function bodyName(id: BodyId): string {
  return BODIES[id].name;
}

export function bodySymbol(id: BodyId): string {
  return BODIES[id].symbol;
}

export function formatBody(p: BodyPosition): string {
  const retro = p.retrograde ? ' ℞' : '';
  return `${BODIES[p.id].name}: ${formatZodiac(p.longitude)}${retro} (${p.house}. ev)`;
}

export function formatAspect(a: Aspect): string {
  const info = ASPECTS[a.type];
  const orb = `${Math.abs(a.orb).toFixed(1)}°`;
  const phase = a.applying ? 'yaklaşan' : 'uzaklaşan';
  return `${BODIES[a.a].name} ${info.symbol} ${BODIES[a.b].name} — ${info.name} (orb ${orb}, ${phase})`;
}

/** Hız: +1.23°/gün */
export function formatSpeed(speed: number): string {
  const s = speed < 0 ? '−' : '+';
  return `${s}${Math.abs(speed).toFixed(2)}°/gün`;
}
