import { EXALTATION, SIGNS } from './constants';
import type { Dignity, DignityKind, PlanetId } from './types';

const CLASSICAL: readonly PlanetId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const MODERN: readonly PlanetId[] = ['uranus', 'neptune', 'pluto'];

function rulesSign(body: PlanetId, sign: number): boolean {
  const s = SIGNS[sign];
  return s.ruler === body || s.modernRuler === body;
}

/** Bir gezegenin bulunduğu burçtaki onur durumu */
export function dignityOf(body: PlanetId, sign: number): DignityKind | null {
  if (!CLASSICAL.includes(body) && !MODERN.includes(body)) return null;
  if (rulesSign(body, sign)) return 'domicile';
  if (rulesSign(body, (sign + 6) % 12)) return 'detriment';
  const ex = EXALTATION[body];
  if (ex !== undefined) {
    if (ex === sign) return 'exaltation';
    if ((ex + 6) % 12 === sign) return 'fall';
  }
  return null;
}

export function computeDignities(positions: { id: PlanetId; sign: number }[]): Dignity[] {
  const out: Dignity[] = [];
  for (const p of positions) {
    const kind = dignityOf(p.id, p.sign);
    if (kind) out.push({ body: p.id, kind });
  }
  return out;
}

export const DIGNITY_NAMES: Record<DignityKind, string> = {
  domicile: 'Yöneticilik (kendi burcunda)',
  exaltation: 'Yücelme',
  detriment: 'Zararlı (sürgün)',
  fall: 'Düşük',
};
