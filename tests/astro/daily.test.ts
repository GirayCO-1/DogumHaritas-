import { describe, expect, it } from 'vitest';

import { computeNatalChart } from '../../src/astro/chart';
import { buildDailyBrief, dayNumber, energyLevel } from '../../src/astro/daily';
import { computeTransits } from '../../src/astro/transits';
import type { TransitAspect, TransitReport } from '../../src/astro/types';

const NATAL = computeNatalChart({
  name: 'Test',
  year: 1989,
  month: 7,
  day: 20,
  hour: 8,
  minute: 30,
  timeUnknown: false,
  timeZone: 'Europe/Istanbul',
  location: { lat: 39.9179, lng: 32.8627 },
  placeName: 'Çankaya, Ankara',
});

function aspect(partial: Partial<TransitAspect>): TransitAspect {
  return {
    a: 'sun',
    b: 'sun',
    type: 'trine',
    angle: 120,
    separation: 120,
    orb: 0,
    maxOrb: 3,
    applying: true,
    strength: 1,
    transitBody: 'sun',
    natalBody: 'sun',
    transitHouse: 1,
    ...partial,
  };
}

describe('günün özeti', () => {
  it('gerçek bir transit raporundan özet üretir', () => {
    const report = computeTransits(NATAL, new Date(Date.UTC(2026, 8, 14, 12, 0)));
    const brief = buildDailyBrief(report, 'tr');

    expect(brief.pulse.length).toBeGreaterThan(20);
    expect(brief.energy).toBeGreaterThanOrEqual(12);
    expect(brief.energy).toBeLessThanOrEqual(98);
    expect(brief.moonLine).toMatch(/^Ay .+ burcunda · .+ · %\d+$/);
    expect(brief.strengths.length).toBeLessThanOrEqual(3);
    expect(brief.cautions.length).toBeLessThanOrEqual(2);
  });

  it('aynı gün için aynı sonucu verir (rastgelelik yok)', () => {
    const report = computeTransits(NATAL, new Date(Date.UTC(2028, 3, 20, 12, 0)));
    const a = buildDailyBrief(report, 'tr');
    const b = buildDailyBrief(report, 'tr');
    expect(a).toEqual(b);
  });

  it('her maddeyi farklı bir transit gezegeninden seçer', () => {
    const report = computeTransits(NATAL, new Date(Date.UTC(2026, 0, 15, 9, 0)));
    const brief = buildDailyBrief(report, 'tr');
    for (const list of [brief.strengths, brief.cautions]) {
      const sources = list.map((i) => i.source);
      expect(new Set(sources).size).toBe(sources.length);
    }
  });

  it('aynı metni iki kez göstermez', () => {
    // Aynı natal noktaya iki farklı gezegenden uyumlu açı gelirse madde
    // metinleri birebir aynı çıkıyordu; yalnızca başlık değişiyordu.
    const report: TransitReport = {
      date: new Date(),
      transitPositions: [],
      aspects: [
        aspect({ type: 'sextile', transitBody: 'venus', natalBody: 'uranus', transitHouse: 3 }),
        aspect({ type: 'sextile', transitBody: 'moon', natalBody: 'uranus', transitHouse: 3 }),
        aspect({ type: 'trine', transitBody: 'chiron', natalBody: 'asc', transitHouse: 9 }),
      ],
      moonPhase: { angle: 0, illumination: 0.1, index: 0, sign: 0 },
      retrogrades: [],
    };
    const brief = buildDailyBrief(report, 'tr');
    const texts = brief.strengths.map((i) => i.text);
    expect(new Set(texts).size).toBe(texts.length);
    // Uranüs'e iki açı var ama yalnızca biri listeye giriyor
    expect(brief.strengths).toHaveLength(2);
  });

  it('birden çok gün boyunca hiçbir özet kendini tekrar etmez', () => {
    for (let i = 0; i < 40; i++) {
      const report = computeTransits(NATAL, new Date(Date.UTC(2026, 0, 1 + i * 9, 12, 0)));
      const brief = buildDailyBrief(report, 'tr');
      for (const list of [brief.strengths, brief.cautions]) {
        const texts = list.map((x) => x.text);
        expect(new Set(texts).size, `gün ${i}: ${texts.join(' | ')}`).toBe(texts.length);
      }
    }
  });

  it('aynı transit sürerken cümle günden güne değişir', () => {
    // Yavaş bir gezegen aynı açıyı haftalarca yapabiliyor; her sabah aynı
    // cümleyi okumamak için cümle gün numarasına göre dönüyor.
    const seen = new Set<string>();
    for (let i = 0; i < 3; i++) {
      const d = new Date(2026, 0, 10 + i, 12);
      const report: TransitReport = {
        date: d,
        transitPositions: [],
        aspects: [aspect({ type: 'square', transitBody: 'saturn', natalBody: 'sun', transitHouse: 1 })],
        moonPhase: { angle: 0, illumination: 0.2, index: 0, sign: 0 },
        retrogrades: [],
      };
      seen.add(buildDailyBrief(report, 'tr').pulse);
    }
    expect(seen.size).toBe(3);
  });

  it('gün numarası yerel takvim gününü izler', () => {
    expect(dayNumber(new Date(2026, 0, 10, 0, 30))).toBe(dayNumber(new Date(2026, 0, 10, 23, 30)));
    expect(dayNumber(new Date(2026, 0, 11, 12))).toBe(dayNumber(new Date(2026, 0, 10, 12)) + 1);
  });

  it('nabzı belirleyen gezegeni bildirir', () => {
    const report: TransitReport = {
      date: new Date(2026, 0, 10, 12),
      transitPositions: [],
      aspects: [aspect({ type: 'square', transitBody: 'pluto', natalBody: 'sun', transitHouse: 1 })],
      moonPhase: { angle: 0, illumination: 0.2, index: 0, sign: 0 },
      retrogrades: [],
    };
    expect(buildDailyBrief(report, 'tr').pulseBody).toBe('pluto');
  });

  it('açı yoksa enerji nötr, metin yedek cümleye düşer', () => {
    const empty: TransitReport = {
      date: new Date(),
      transitPositions: [],
      aspects: [],
      moonPhase: { angle: 0, illumination: 0, index: 0, sign: 0 },
      retrogrades: [],
    };
    const brief = buildDailyBrief(empty, 'tr');
    expect(brief.energy).toBe(50);
    expect(brief.strengths).toHaveLength(0);
    expect(brief.cautions).toHaveLength(0);
    expect(brief.pulseBody).toBeNull();
  });

  it('yalnızca uyumlu açılar enerjiyi yükseltir, zorlayıcılar düşürür', () => {
    const harmonious = [aspect({ type: 'trine' }), aspect({ type: 'sextile', transitBody: 'venus' })];
    const tense = [aspect({ type: 'square' }), aspect({ type: 'opposition', transitBody: 'mars' })];
    expect(energyLevel(harmonious)).toBeGreaterThan(80);
    expect(energyLevel(tense)).toBeLessThan(20);
    expect(energyLevel([...harmonious, ...tense])).toBeGreaterThan(30);
    expect(energyLevel([...harmonious, ...tense])).toBeLessThan(70);
  });

  it('zayıf açı güçlü açıdan daha az ağırlık taşır', () => {
    const strong = energyLevel([aspect({ type: 'trine', strength: 1 }), aspect({ type: 'square', strength: 0.1, transitBody: 'mars' })]);
    const weak = energyLevel([aspect({ type: 'trine', strength: 0.1 }), aspect({ type: 'square', strength: 1, transitBody: 'mars' })]);
    expect(strong).toBeGreaterThan(weak);
  });

  it('güçlü yanlar uyumlu, dikkat maddeleri zorlayıcı açılardan gelir', () => {
    const report: TransitReport = {
      date: new Date(),
      transitPositions: [],
      aspects: [
        aspect({ type: 'trine', transitBody: 'jupiter', natalBody: 'sun', transitHouse: 10 }),
        aspect({ type: 'square', transitBody: 'saturn', natalBody: 'moon', transitHouse: 4 }),
      ],
      moonPhase: { angle: 90, illumination: 0.5, index: 2, sign: 3 },
      retrogrades: [],
    };
    const brief = buildDailyBrief(report, 'tr');
    expect(brief.strengths[0].source).toContain('Jüpiter');
    expect(brief.strengths[0].text).toContain('destek alıyor');
    expect(brief.strengths[0].text).toContain('10. ev');
    expect(brief.cautions[0].source).toContain('Satürn');
    expect(brief.cautions[0].text).toContain('zorlanabilir');
    expect(brief.cautions[0].text).toContain('4. ev');
  });
});
