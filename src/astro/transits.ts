import { computeCrossAspects, type AspectSource } from './aspects';
import { BODIES } from './constants';
import { computeAllBodies, makeTime, trueObliquity } from './ephemeris';
import { houseOf } from './houses';
import { norm360, zodiacPosition } from './math';
import type {
  AspectType,
  BodyId,
  BodyPosition,
  MoonPhase,
  NatalChart,
  PlanetId,
  TransitAspect,
  TransitReport,
} from './types';

/** Transitlerde kullanılan (natal'dan daha dar) orblar */
export const TRANSIT_ORBS: Partial<Record<AspectType, number>> = {
  conjunction: 3,
  opposition: 3,
  trine: 3,
  square: 3,
  sextile: 2,
  quincunx: 1.5,
};

const TRANSIT_BODIES: readonly PlanetId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northNode',
];

const NATAL_TARGETS: readonly BodyId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northNode',
  'asc',
  'mc',
];

const PHASE_NAMES = [
  'Yeni Ay',
  'Hilal (Büyüyen)',
  'İlk Dördün',
  'Şişkin Ay (Büyüyen)',
  'Dolunay',
  'Şişkin Ay (Küçülen)',
  'Son Dördün',
  'Hilal (Küçülen)',
];

export function moonPhaseFor(sunLon: number, moonLon: number): MoonPhase {
  const angle = norm360(moonLon - sunLon);
  const illumination = (1 - Math.cos((angle * Math.PI) / 180)) / 2;
  // 8 evre, her biri 45°; Yeni Ay 337.5–22.5 arası
  const idx = Math.floor(((angle + 22.5) % 360) / 45);
  return { angle, illumination, name: PHASE_NAMES[idx], sign: zodiacPosition(moonLon).sign };
}

/**
 * Verilen andaki gökyüzünün natal haritayla yaptığı açılar.
 * Transit evleri natal ev başlangıçlarına göre bulunur.
 */
export function computeTransits(natal: NatalChart, date: Date = new Date()): TransitReport {
  const time = makeTime(date);
  const eps = trueObliquity(time);
  const raw = computeAllBodies(time, eps, natal.options.nodeType);

  const transitPositions: BodyPosition[] = TRANSIT_BODIES.map((id) => {
    const r = raw.get(id)!;
    const z = zodiacPosition(r.longitude);
    return {
      id,
      ...z,
      latitude: r.latitude,
      speed: r.speed,
      retrograde: BODIES[id].physical && r.speed < 0,
      house: houseOf(z.longitude, natal.houses.cusps),
      distance: r.distance,
      declination: r.declination,
    };
  });

  const left = new Map<BodyId, AspectSource>();
  for (const p of transitPositions) left.set(p.id, { longitude: p.longitude, speed: p.speed });
  const right = new Map<BodyId, AspectSource>();
  for (const p of [...natal.planets, ...natal.points]) right.set(p.id, { longitude: p.longitude, speed: 0 });

  const cross = computeCrossAspects(left, right, TRANSIT_BODIES, NATAL_TARGETS, {
    orbs: TRANSIT_ORBS,
    luminaryOrbFactor: 1,
  });

  const houseByTransit = new Map(transitPositions.map((p) => [p.id, p.house]));
  const aspects: TransitAspect[] = cross.map((a) => ({
    ...a,
    transitBody: a.a,
    natalBody: a.b,
    transitHouse: houseByTransit.get(a.a) ?? 0,
  }));

  const sun = raw.get('sun')!;
  const moon = raw.get('moon')!;

  return {
    date,
    transitPositions,
    aspects,
    moonPhase: moonPhaseFor(sun.longitude, moon.longitude),
    retrogrades: transitPositions.filter((p) => p.retrograde).map((p) => p.id as PlanetId),
  };
}
