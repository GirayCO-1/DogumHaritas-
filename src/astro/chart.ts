import { computeAspects } from './aspects';
import { BODIES, PLANET_ORDER, SIGNS } from './constants';
import { computeDignities } from './dignities';
import {
  computeAllBodies,
  greenwichSiderealTime,
  localSiderealTime,
  makeTime,
  trueObliquity,
  type RawBody,
} from './ephemeris';
import { computeHouses, houseOf } from './houses';
import { julianDay, norm360, zodiacPosition } from './math';
import { localToUtc } from './time';
import type {
  BirthInput,
  BodyId,
  BodyPosition,
  ChartOptions,
  ChartSummary,
  Element,
  ElementBalance,
  Modality,
  ModalityBalance,
  NatalChart,
  PlanetId,
  PointId,
} from './types';

function toBodyPosition(id: BodyId, raw: RawBody, cusps: number[]): BodyPosition {
  const z = zodiacPosition(raw.longitude);
  return {
    id,
    ...z,
    latitude: raw.latitude,
    speed: raw.speed,
    retrograde: BODIES[id].physical && raw.speed < 0,
    house: houseOf(z.longitude, cusps),
    distance: raw.distance,
    declination: raw.declination,
  };
}

function pointPosition(id: PointId, longitude: number, cusps: number[]): BodyPosition {
  const z = zodiacPosition(longitude);
  return {
    id,
    ...z,
    latitude: 0,
    speed: 0,
    retrograde: false,
    house: houseOf(z.longitude, cusps),
  };
}

export function computeBalances(bodies: BodyPosition[]): {
  elements: ElementBalance;
  modalities: ModalityBalance;
} {
  const elements: ElementBalance = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities: ModalityBalance = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const b of bodies) {
    const w = BODIES[b.id].weight;
    if (!w) continue;
    const s = SIGNS[b.sign];
    elements[s.element] += w;
    modalities[s.modality] += w;
  }
  return { elements, modalities };
}

function dominant<K extends string>(obj: Record<K, number>): K {
  return (Object.keys(obj) as K[]).reduce((best, k) => (obj[k] > obj[best] ? k : best));
}

/**
 * Doğum haritasını hesaplar.
 * Tüm açısal değerler derece cinsinden, tropikal zodyak, tarihin gerçek ekliptiği.
 */
export function computeNatalChart(input: BirthInput, options: ChartOptions = {}): NatalChart {
  const houseSystem = options.houseSystem ?? 'placidus';
  const nodeType = options.nodeType ?? 'true';

  const { utc, offsetMinutes } = localToUtc(input);
  const time = makeTime(utc);
  const eps = trueObliquity(time);
  const gast = greenwichSiderealTime(time);
  const ramc = localSiderealTime(time, input.location.lng);

  const houses = computeHouses(houseSystem, ramc, eps, input.location.lat);
  const raw = computeAllBodies(time, eps, nodeType);

  const planets: BodyPosition[] = PLANET_ORDER.map((id) => toBodyPosition(id, raw.get(id)!, houses.cusps));
  const byId = new Map<BodyId, BodyPosition>(planets.map((p) => [p.id, p]));

  const sun = byId.get('sun')!;
  const moon = byId.get('moon')!;
  const isDayChart = norm360(sun.longitude - houses.asc) >= 180;
  const fortune = isDayChart
    ? houses.asc + moon.longitude - sun.longitude
    : houses.asc + sun.longitude - moon.longitude;

  const points: BodyPosition[] = [
    pointPosition('asc', houses.asc, houses.cusps),
    pointPosition('mc', houses.mc, houses.cusps),
    pointPosition('dsc', houses.dsc, houses.cusps),
    pointPosition('ic', houses.ic, houses.cusps),
    pointPosition('vertex', houses.vertex, houses.cusps),
    pointPosition('fortune', norm360(fortune), houses.cusps),
  ];
  for (const p of points) byId.set(p.id, p);

  const aspectSources = new Map<BodyId, { longitude: number; speed: number }>();
  for (const [id, p] of byId) aspectSources.set(id, { longitude: p.longitude, speed: p.speed });
  const aspects = computeAspects(aspectSources, {
    bodies: options.aspectBodies,
    types: options.aspectTypes,
    orbs: options.orbs,
    luminaryOrbFactor: options.luminaryOrbFactor,
  });

  const { elements, modalities } = computeBalances([...planets, ...points]);
  const dignities = computeDignities(
    planets.filter((p) => BODIES[p.id].physical).map((p) => ({ id: p.id as PlanetId, sign: p.sign })),
  );

  const summary: ChartSummary = {
    sunSign: sun.sign,
    moonSign: moon.sign,
    ascSign: points[0].sign,
    dominantElement: dominant<Element>(elements),
    dominantModality: dominant<Modality>(modalities),
    retrogradeCount: planets.filter((p) => p.retrograde && p.id !== 'sun' && p.id !== 'moon').length,
  };

  return {
    input,
    options: { houseSystem, nodeType },
    meta: {
      utc,
      jd: julianDay(utc),
      obliquity: eps,
      ramc,
      gast,
      isDayChart,
      timeZone: input.timeZone,
      utcOffsetMinutes: offsetMinutes,
    },
    planets,
    points,
    houses,
    aspects,
    elements,
    modalities,
    dignities,
    summary,
  };
}

/** Haritadaki bir cismi id ile bulur */
export function findBody(chart: NatalChart, id: BodyId): BodyPosition | undefined {
  return chart.planets.find((p) => p.id === id) ?? chart.points.find((p) => p.id === id);
}
