import { ASPECTS, DEFAULT_ASPECT_BODIES, DEFAULT_ASPECT_TYPES } from './constants';
import { angularDistance } from './math';
import type { Aspect, AspectType, BodyId } from './types';

export interface AspectSource {
  longitude: number;
  /** derece/gün; hesaplanan noktalar için 0 */
  speed: number;
}

export interface AspectOptions {
  bodies?: readonly BodyId[];
  types?: readonly AspectType[];
  orbs?: Partial<Record<AspectType, number>>;
  luminaryOrbFactor?: number;
}

const ANGLES = new Set<BodyId>(['asc', 'mc', 'dsc', 'ic', 'vertex']);
const LUMINARIES = new Set<BodyId>(['sun', 'moon']);

/** Anlamsız çiftler: açı–açı, düğüm–düğüm, açı–karşıt açı */
function skipPair(a: BodyId, b: BodyId): boolean {
  if (ANGLES.has(a) && ANGLES.has(b)) return true;
  if ((a === 'northNode' && b === 'southNode') || (a === 'southNode' && b === 'northNode')) return true;
  return false;
}

export function maxOrbFor(
  type: AspectType,
  a: BodyId,
  b: BodyId,
  orbs?: Partial<Record<AspectType, number>>,
  luminaryOrbFactor = 1.25,
): number {
  const base = orbs?.[type] ?? ASPECTS[type].orb;
  const lum = LUMINARIES.has(a) || LUMINARIES.has(b);
  return lum ? base * luminaryOrbFactor : base;
}

/**
 * İki cisim arasındaki tek bir açıyı bulur (varsa).
 * Aynı çift için en dar orb'lu açı türü seçilir.
 */
export function findAspect(
  a: BodyId,
  pa: AspectSource,
  b: BodyId,
  pb: AspectSource,
  opts: AspectOptions = {},
): Aspect | null {
  const types = opts.types ?? DEFAULT_ASPECT_TYPES;
  const separation = angularDistance(pa.longitude, pb.longitude);
  let best: Aspect | null = null;
  for (const type of types) {
    const info = ASPECTS[type];
    const maxOrb = maxOrbFor(type, a, b, opts.orbs, opts.luminaryOrbFactor);
    const orb = separation - info.angle;
    if (Math.abs(orb) > maxOrb) continue;
    // Kısa süre sonra açı daralıyor mu?
    const dt = 0.05;
    const sepLater = angularDistance(pa.longitude + pa.speed * dt, pb.longitude + pb.speed * dt);
    const applying = Math.abs(sepLater - info.angle) < Math.abs(orb);
    const candidate: Aspect = {
      a,
      b,
      type,
      angle: info.angle,
      separation,
      orb,
      maxOrb,
      applying,
      strength: 1 - Math.abs(orb) / maxOrb,
    };
    if (!best || Math.abs(candidate.orb) < Math.abs(best.orb)) best = candidate;
  }
  return best;
}

/** Tek bir harita içindeki tüm açılar */
export function computeAspects(
  positions: ReadonlyMap<BodyId, AspectSource>,
  opts: AspectOptions = {},
): Aspect[] {
  const bodies = (opts.bodies ?? DEFAULT_ASPECT_BODIES).filter((id) => positions.has(id));
  const out: Aspect[] = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      if (skipPair(a, b)) continue;
      const asp = findAspect(a, positions.get(a)!, b, positions.get(b)!, opts);
      if (asp) out.push(asp);
    }
  }
  return out.sort((x, y) => Math.abs(x.orb) - Math.abs(y.orb));
}

/**
 * İki farklı harita (transit/sinastri) arasındaki açılar.
 * a-tarafı `left`, b-tarafı `right` listesinden gelir.
 */
export function computeCrossAspects(
  left: ReadonlyMap<BodyId, AspectSource>,
  right: ReadonlyMap<BodyId, AspectSource>,
  leftBodies: readonly BodyId[],
  rightBodies: readonly BodyId[],
  opts: AspectOptions = {},
): Aspect[] {
  const out: Aspect[] = [];
  for (const a of leftBodies) {
    const pa = left.get(a);
    if (!pa) continue;
    for (const b of rightBodies) {
      const pb = right.get(b);
      if (!pb) continue;
      if (ANGLES.has(a) && ANGLES.has(b)) continue;
      const asp = findAspect(a, pa, b, pb, opts);
      if (asp) out.push(asp);
    }
  }
  return out.sort((x, y) => Math.abs(x.orb) - Math.abs(y.orb));
}
