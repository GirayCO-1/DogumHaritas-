import { computeCrossAspects, type AspectSource } from './aspects';
import { ASPECTS, PLANET_ORDER } from './constants';
import { houseOf } from './houses';
import { clamp } from './math';
import type { Aspect, AspectType, BodyId, NatalChart, PlanetId, SynastryAspect, SynastryReport } from './types';

export const SYNASTRY_ORBS: Partial<Record<AspectType, number>> = {
  conjunction: 7,
  opposition: 6,
  trine: 6,
  square: 6,
  sextile: 4,
  quincunx: 2,
};

const SYNASTRY_BODIES: readonly BodyId[] = [
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
  'northNode',
  'asc',
  'mc',
];

/** Cismin ilişki dinamiğindeki ağırlığı */
const IMPORTANCE: Partial<Record<BodyId, number>> = {
  sun: 1,
  moon: 1,
  venus: 1,
  mars: 0.9,
  asc: 0.9,
  mercury: 0.7,
  jupiter: 0.6,
  saturn: 0.7,
  mc: 0.5,
  northNode: 0.5,
  uranus: 0.4,
  neptune: 0.4,
  pluto: 0.5,
};

/** Kavuşumun doğası cisimlere göre değişir */
const SOFT_CONJ = new Set<BodyId>(['sun', 'moon', 'venus', 'jupiter', 'mercury', 'asc', 'northNode']);
const HARD_CONJ = new Set<BodyId>(['saturn', 'pluto', 'uranus', 'mars', 'neptune']);

function aspectWeight(a: Aspect): number {
  const info = ASPECTS[a.type];
  let base: number;
  if (a.type === 'conjunction') {
    const hard = HARD_CONJ.has(a.a) || HARD_CONJ.has(a.b);
    const soft = SOFT_CONJ.has(a.a) && SOFT_CONJ.has(a.b);
    base = soft ? 1 : hard ? 0.15 : 0.6;
  } else if (info.nature === 'harmonious') {
    base = a.type === 'trine' ? 0.9 : a.type === 'sextile' ? 0.6 : 0.3;
  } else {
    base = a.type === 'opposition' ? -0.5 : a.type === 'square' ? -0.7 : -0.3;
  }
  const imp = ((IMPORTANCE[a.a] ?? 0.3) + (IMPORTANCE[a.b] ?? 0.3)) / 2;
  return base * imp * (0.5 + 0.5 * a.strength);
}

interface CategoryDef {
  key: keyof SynastryReport['categories'];
  bodies: readonly BodyId[];
}

const CATEGORIES: CategoryDef[] = [
  { key: 'love', bodies: ['sun', 'moon', 'venus', 'asc', 'northNode'] },
  { key: 'communication', bodies: ['mercury', 'sun', 'moon', 'jupiter', 'asc'] },
  { key: 'harmony', bodies: ['moon', 'venus', 'jupiter', 'sun', 'neptune'] },
  { key: 'passion', bodies: ['mars', 'venus', 'pluto', 'sun', 'uranus'] },
  { key: 'stability', bodies: ['saturn', 'jupiter', 'sun', 'moon', 'mc'] },
];

function toScore(sum: number, count: number): number {
  // Ortalama ağırlık −1…+1 aralığında; 50 merkezli, ±35 yayılım, çift sayısıyla hafif güven artışı
  if (count === 0) return 50;
  const avg = sum / count;
  const confidence = Math.min(1, count / 6);
  return Math.round(clamp(50 + avg * 45 * (0.5 + 0.5 * confidence) + Math.sign(sum) * Math.min(10, Math.abs(sum)), 5, 98));
}

/** İki harita arasındaki uyum analizi */
export function computeSynastry(a: NatalChart, b: NatalChart): SynastryReport {
  const left = new Map<BodyId, AspectSource>();
  for (const p of [...a.planets, ...a.points]) left.set(p.id, { longitude: p.longitude, speed: 0 });
  const right = new Map<BodyId, AspectSource>();
  for (const p of [...b.planets, ...b.points]) right.set(p.id, { longitude: p.longitude, speed: 0 });

  const cross = computeCrossAspects(left, right, SYNASTRY_BODIES, SYNASTRY_BODIES, {
    orbs: SYNASTRY_ORBS,
    luminaryOrbFactor: 1,
  });

  const aspects: SynastryAspect[] = cross.map((x) => ({
    ...x,
    personA: x.a,
    personB: x.b,
    weight: aspectWeight(x),
  }));

  const total = aspects.reduce((s, x) => s + x.weight, 0);
  const score = toScore(total, aspects.length);

  const categories = {} as SynastryReport['categories'];
  for (const cat of CATEGORIES) {
    const set = new Set(cat.bodies);
    const subset = aspects.filter((x) => set.has(x.personA) && set.has(x.personB));
    categories[cat.key] = toScore(
      subset.reduce((s, x) => s + x.weight, 0),
      subset.length,
    );
  }

  const housesAinB = {} as Record<PlanetId, number>;
  const housesBinA = {} as Record<PlanetId, number>;
  for (const id of PLANET_ORDER) {
    const pa = a.planets.find((p) => p.id === id);
    const pb = b.planets.find((p) => p.id === id);
    if (pa) housesAinB[id] = houseOf(pa.longitude, b.houses.cusps);
    if (pb) housesBinA[id] = houseOf(pb.longitude, a.houses.cusps);
  }

  return { aspects, score, categories, housesAinB, housesBinA };
}

export const SYNASTRY_CATEGORY_NAMES: Record<keyof SynastryReport['categories'], string> = {
  love: 'Aşk & Romantizm',
  communication: 'İletişim',
  harmony: 'Duygusal Uyum',
  passion: 'Tutku & Çekim',
  stability: 'Kalıcılık & Güven',
};
