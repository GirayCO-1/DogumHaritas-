import { getAllPlanets, getPlanet } from 'ephemeris';
import { describe, expect, it } from 'vitest';

import { computeAspects } from '../../src/astro/aspects';
import { computeNatalChart, findBody } from '../../src/astro/chart';
import { dignityOf } from '../../src/astro/dignities';
import {
  CHIRON_RANGE,
  chironPosition,
  computeAllBodies,
  localSiderealTime,
  makeTime,
  meanLilithLongitude,
  trueNodeLongitude,
  trueObliquity,
} from '../../src/astro/ephemeris';
import { ascendant, computeHouses, houseOf, midheaven, vertex } from '../../src/astro/houses';
import {
  angularDistance,
  eclipticToEquatorial,
  equatorialToEcliptic,
  equatorialToHorizontal,
  norm180,
  norm360,
  zodiacPosition,
} from '../../src/astro/math';
import { localToUtc } from '../../src/astro/time';
import type { BirthInput, HouseSystem, PlanetId } from '../../src/astro/types';

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

const sample: BirthInput = {
  name: 'Test',
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
  timeZone: 'Europe/Istanbul',
  location: ISTANBUL,
};

/* ------------------------------------------------------------------ */
describe('math', () => {
  it('norm360 / norm180 / angularDistance', () => {
    expect(norm360(-30)).toBe(330);
    expect(norm360(725)).toBe(5);
    expect(norm180(190)).toBe(-170);
    expect(norm180(170)).toBe(170);
    expect(angularDistance(10, 350)).toBe(20);
    expect(angularDistance(0, 180)).toBe(180);
  });

  it('zodiacPosition splits sign and degree', () => {
    const z = zodiacPosition(95.5);
    expect(z.sign).toBe(3); // Yengeç
    expect(z.deg).toBe(5);
    expect(z.min).toBe(30);
    // 29°59'59.9" burç içinde kalır
    const edge = zodiacPosition(29.99999);
    expect(edge.sign).toBe(0);
    expect(edge.deg).toBe(29);
  });

  it('ecliptic ↔ equatorial roundtrip', () => {
    const eps = 23.44;
    for (const [lon, lat] of [
      [0, 0],
      [90, 5],
      [200, -3],
      [359, 1],
    ]) {
      const { ra, dec } = eclipticToEquatorial(lon, lat, eps);
      const back = equatorialToEcliptic(ra, dec, eps);
      expect(angularDistance(back.lon, lon)).toBeLessThan(1e-9);
      expect(Math.abs(back.lat - lat)).toBeLessThan(1e-9);
    }
  });
});

/* ------------------------------------------------------------------ */
describe('time', () => {
  it('İstanbul 1990 yaz saati (UTC+3) doğru uygulanır', () => {
    const { utc, offsetMinutes } = localToUtc(sample);
    expect(offsetMinutes).toBe(180);
    expect(utc.toISOString()).toBe('1990-06-15T11:30:00.000Z');
  });

  it('İstanbul 1990 kış saati (UTC+2)', () => {
    const { offsetMinutes } = localToUtc({ ...sample, month: 1 });
    expect(offsetMinutes).toBe(120);
  });

  it('2020 sonrası Türkiye kalıcı UTC+3', () => {
    const { offsetMinutes } = localToUtc({ ...sample, year: 2020, month: 1 });
    expect(offsetMinutes).toBe(180);
  });

  it('saat bilinmiyorsa öğlen kullanılır', () => {
    const r = localToUtc({ ...sample, timeUnknown: true });
    expect(r.usedNoon).toBe(true);
    expect(r.utc.toISOString()).toBe('1990-06-15T09:00:00.000Z');
  });

  it('geçersiz saat dilimi hata verir', () => {
    expect(() => localToUtc({ ...sample, timeZone: 'Mars/Olympus' })).toThrow();
  });
});

/* ------------------------------------------------------------------ */
describe('ephemeris', () => {
  it('astronomy-engine ile Moshier (ephemeris paketi) uyuşur', () => {
    // Bağımsız iki motorun birbirini doğrulaması
    const dates = [
      new Date(Date.UTC(2024, 0, 1, 0, 0, 0)),
      new Date(Date.UTC(1990, 5, 15, 11, 30, 0)),
      new Date(Date.UTC(1965, 2, 3, 22, 15, 0)),
    ];
    const map: Record<string, PlanetId> = {
      sun: 'sun',
      moon: 'moon',
      mercury: 'mercury',
      venus: 'venus',
      mars: 'mars',
      jupiter: 'jupiter',
      saturn: 'saturn',
      uranus: 'uranus',
      neptune: 'neptune',
      pluto: 'pluto',
    };
    for (const d of dates) {
      const t = makeTime(d);
      const eps = trueObliquity(t);
      const ours = computeAllBodies(t, eps, 'true');
      // ephemeris paketi Date'i TT sayar → ΔT ekle
      const dTT = new Date(d.getTime() + (t.tt - t.ut) * 86400000);
      const theirs = getAllPlanets(dTT, 0, 0, 0).observed;
      for (const [k, id] of Object.entries(map)) {
        const a = ours.get(id)!.longitude;
        const b = theirs[k].apparentLongitudeDd;
        const tol = id === 'moon' ? 0.05 : 0.02;
        expect(angularDistance(a, b), `${id} @ ${d.toISOString()}`).toBeLessThan(tol);
      }
      // Gerçek düğüm ve ortalama düğüm
      expect(angularDistance(ours.get('northNode')!.longitude, theirs.trueRahu.apparentLongitudeDd)).toBeLessThan(0.3);
    }
  });

  it('bilinen konumlar: 1 Ocak 2024', () => {
    const t = makeTime(new Date(Date.UTC(2024, 0, 1)));
    const eps = trueObliquity(t);
    const b = computeAllBodies(t, eps);
    // Güneş ~10° Oğlak
    expect(b.get('sun')!.longitude).toBeCloseTo(280.04, 1);
    // Chiron ~15°34' Koç (27 Aralık 2023'te 15°27' Koç'ta ileri döndü)
    expect(b.get('chiron')!.longitude).toBeGreaterThan(15.3);
    expect(b.get('chiron')!.longitude).toBeLessThan(15.8);
    // Ortalama Lilith ~9°50' Başak
    expect(meanLilithLongitude(t)).toBeGreaterThan(159);
    expect(meanLilithLongitude(t)).toBeLessThan(161);
    // Gerçek düğüm ~21° Koç
    expect(trueNodeLongitude(t)).toBeGreaterThan(20);
    expect(trueNodeLongitude(t)).toBeLessThan(22);
    // Güney düğüm tam karşıda
    expect(angularDistance(b.get('southNode')!.longitude, b.get('northNode')!.longitude)).toBeCloseTo(180, 6);
  });

  it('hız ve retro işareti tutarlı', () => {
    // Ağustos 2023: Merkür 23 Ağustos'ta retroya girdi
    const t = makeTime(new Date(Date.UTC(2023, 7, 30)));
    const eps = trueObliquity(t);
    const b = computeAllBodies(t, eps);
    expect(b.get('mercury')!.speed).toBeLessThan(0);
    expect(b.get('sun')!.speed).toBeGreaterThan(0.9);
    expect(b.get('sun')!.speed).toBeLessThan(1.1);
    expect(b.get('moon')!.speed).toBeGreaterThan(11);
    expect(b.get('moon')!.speed).toBeLessThan(15.5);
  });
});

/* ------------------------------------------------------------------ */
describe('houses', () => {
  const t = makeTime(new Date(Date.UTC(1990, 5, 15, 11, 30)));
  const eps = trueObliquity(t);
  const ramc = localSiderealTime(t, ISTANBUL.lng);
  const lat = ISTANBUL.lat;

  it('ekvatorda MC=0 Koç iken ASC=0 Yengeç', () => {
    expect(ascendant(0, 23.44, 0)).toBeCloseTo(90, 6);
    expect(midheaven(0, 23.44)).toBeCloseTo(0, 6);
  });

  it('ASC ile MC arasındaki yay 180°den küçük (kuzey yarımküre, normal)', () => {
    const asc = ascendant(ramc, eps, lat);
    const mc = midheaven(ramc, eps);
    const arc = norm360(asc - mc);
    expect(arc).toBeGreaterThan(30);
    expect(arc).toBeLessThan(180);
  });

  const systems: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry', 'campanus', 'regiomontanus'];

  it.each(systems)('%s: 12 ev sıralı, karşıt evler 180°, ASC=1, MC=10 (kadran)', (sys) => {
    const h = computeHouses(sys, ramc, eps, lat);
    expect(h.cusps).toHaveLength(12);
    expect(h.fallbackFrom).toBeUndefined();
    // Sıralı (saat yönünün tersine artan boylam)
    let total = 0;
    for (let i = 0; i < 12; i++) {
      const span = norm360(h.cusps[(i + 1) % 12] - h.cusps[i]);
      expect(span).toBeGreaterThan(0);
      expect(span).toBeLessThan(180);
      total += span;
    }
    expect(total).toBeCloseTo(360, 6);
    for (let i = 0; i < 6; i++) {
      expect(angularDistance(h.cusps[i], h.cusps[i + 6])).toBeCloseTo(180, 6);
    }
    if (sys !== 'whole') expect(h.cusps[0]).toBeCloseTo(h.asc, 6);
    if (sys !== 'whole' && sys !== 'equal') expect(h.cusps[9]).toBeCloseTo(h.mc, 6);
  });

  it('whole sign: burç başlangıçları', () => {
    const h = computeHouses('whole', ramc, eps, lat);
    for (const c of h.cusps) expect(c % 30).toBeCloseTo(0, 9);
  });

  it('Placidus, Koch, Regiomontanus, Campanus orta enlemde birbirine yakın (< 12°)', () => {
    const p = computeHouses('placidus', ramc, eps, lat);
    for (const sys of ['koch', 'regiomontanus', 'campanus'] as HouseSystem[]) {
      const h = computeHouses(sys, ramc, eps, lat);
      for (let i = 0; i < 12; i++) {
        expect(angularDistance(h.cusps[i], p.cusps[i]), `${sys} cusp ${i + 1}`).toBeLessThan(12);
      }
    }
  });

  it('ekvatorda tüm kadran sistemleri aynı sonucu verir', () => {
    const ref = computeHouses('placidus', 123.4, 23.44, 0);
    for (const sys of ['koch', 'regiomontanus', 'campanus'] as HouseSystem[]) {
      const h = computeHouses(sys, 123.4, 23.44, 0);
      for (let i = 0; i < 12; i++) expect(angularDistance(h.cusps[i], ref.cusps[i])).toBeLessThan(1e-6);
    }
  });

  it('kutup enleminde Placidus Porphyry\'ye düşer', () => {
    const h = computeHouses('placidus', ramc, eps, 70);
    expect(h.system).toBe('porphyry');
    expect(h.fallbackFrom).toBe('placidus');
  });

  it('güney yarımkürede de tutarlı', () => {
    const h = computeHouses('placidus', ramc, eps, -33.9);
    expect(h.fallbackFrom).toBeUndefined();
    for (let i = 0; i < 12; i++) {
      const span = norm360(h.cusps[(i + 1) % 12] - h.cusps[i]);
      expect(span).toBeGreaterThan(0);
      expect(span).toBeLessThan(180);
    }
  });

  it('Vertex ana dikey dairenin batı kesişimidir (azimut ≈ 270°)', () => {
    for (const phi of [41.0, 55.7, -33.9, 10.0]) {
      const v = vertex(ramc, eps, phi);
      const { ra, dec } = eclipticToEquatorial(v, 0, eps);
      const { azimuth, altitude } = equatorialToHorizontal(ra, dec, ramc, phi);
      expect(Math.abs(norm180(azimuth - 270)), `lat ${phi} az=${azimuth}`).toBeLessThan(0.01);
      expect(Math.abs(altitude)).toBeLessThan(90);
    }
    // ASC ufukta ve doğuda
    const asc = ascendant(ramc, eps, lat);
    const { ra, dec } = eclipticToEquatorial(asc, 0, eps);
    const hz = equatorialToHorizontal(ra, dec, ramc, lat);
    expect(Math.abs(hz.altitude)).toBeLessThan(0.01);
    expect(hz.azimuth).toBeGreaterThan(0);
    expect(hz.azimuth).toBeLessThan(180);
    // MC meridyende
    const mc = midheaven(ramc, eps);
    const e2 = eclipticToEquatorial(mc, 0, eps);
    expect(Math.abs(norm180(e2.ra - ramc))).toBeLessThan(1e-6);
  });

  it('houseOf: sınırlar ve sarma', () => {
    const cusps = [350, 20, 50, 80, 110, 140, 170, 200, 230, 260, 290, 320];
    expect(houseOf(355, cusps)).toBe(1);
    expect(houseOf(10, cusps)).toBe(1);
    expect(houseOf(20, cusps)).toBe(2);
    expect(houseOf(349.9, cusps)).toBe(12);
    expect(houseOf(200, cusps)).toBe(8);
  });
});

/* ------------------------------------------------------------------ */
describe('aspects', () => {
  it('temel açılar bulunur, orb ve uygulama yönü doğru', () => {
    const pos = new Map<any, { longitude: number; speed: number }>([
      ['sun', { longitude: 10, speed: 1 }],
      ['moon', { longitude: 100.5, speed: 13 }], // kare, orb +0.5, Ay hızlı → uzaklaşan
      ['mars', { longitude: 132, speed: 0.6 }], // Güneş'e üçgen, orb +2; Güneş daha hızlı → aralık 120'ye kapanıyor → yaklaşan
      ['saturn', { longitude: 250, speed: 0.1 }], // Ay'a: 149.5 → quincunx
    ]);
    const asp = computeAspects(pos, { bodies: ['sun', 'moon', 'mars', 'saturn'] });
    const find = (a: string, b: string) => asp.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    const sm = find('sun', 'moon')!;
    expect(sm.type).toBe('square');
    expect(sm.orb).toBeCloseTo(0.5, 6);
    expect(sm.applying).toBe(false);
    const sma = find('sun', 'mars')!;
    expect(sma.type).toBe('trine');
    expect(sma.orb).toBeCloseTo(2, 6);
    expect(sma.applying).toBe(true);
    const ms = find('moon', 'saturn')!;
    expect(ms.type).toBe('quincunx');
    // Sıralama orb'a göre
    for (let i = 1; i < asp.length; i++) expect(Math.abs(asp[i].orb)).toBeGreaterThanOrEqual(Math.abs(asp[i - 1].orb));
  });

  it('açı–açı ve düğüm–düğüm çiftleri atlanır', () => {
    const pos = new Map<any, { longitude: number; speed: number }>([
      ['asc', { longitude: 0, speed: 0 }],
      ['mc', { longitude: 270, speed: 0 }],
      ['northNode', { longitude: 30, speed: 0 }],
      ['southNode', { longitude: 210, speed: 0 }],
    ]);
    const asp = computeAspects(pos, { bodies: ['asc', 'mc', 'northNode', 'southNode'] });
    expect(asp.find((x) => x.a === 'asc' && x.b === 'mc')).toBeUndefined();
    expect(asp.find((x) => x.a === 'northNode' && x.b === 'southNode')).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ */
describe('dignities', () => {
  it('yöneticilik, yücelme, zarar, düşük', () => {
    expect(dignityOf('sun', 4)).toBe('domicile'); // Aslan
    expect(dignityOf('sun', 0)).toBe('exaltation'); // Koç
    expect(dignityOf('sun', 10)).toBe('detriment'); // Kova
    expect(dignityOf('sun', 6)).toBe('fall'); // Terazi
    expect(dignityOf('pluto', 7)).toBe('domicile'); // Akrep (modern)
    expect(dignityOf('mars', 7)).toBe('domicile');
    expect(dignityOf('venus', 2)).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
describe('natal chart', () => {
  it('tam harita hesaplanır ve tutarlıdır', () => {
    const chart = computeNatalChart(sample);
    expect(chart.planets).toHaveLength(14);
    expect(chart.points).toHaveLength(6);
    expect(chart.houses.cusps).toHaveLength(12);
    // Güneş 15 Haziran → İkizler sonu (≈ 24° İkizler)
    const sun = findBody(chart, 'sun')!;
    expect(sun.sign).toBe(2);
    expect(sun.deg).toBeGreaterThanOrEqual(23);
    // ASC 1. evde, MC 10. evde
    expect(findBody(chart, 'asc')!.house).toBe(1);
    expect(findBody(chart, 'mc')!.house).toBe(10);
    // Öğleden sonra 14:30 → gündüz haritası
    expect(chart.meta.isDayChart).toBe(true);
    // Şans Noktası gündüz formülü
    const moon = findBody(chart, 'moon')!;
    const fortune = findBody(chart, 'fortune')!;
    expect(angularDistance(fortune.longitude, chart.houses.asc + moon.longitude - sun.longitude)).toBeLessThan(1e-6);
    // Her gezegen 1–12 arasında bir evde
    for (const p of chart.planets) {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
    // Element toplamı > 0
    const total = Object.values(chart.elements).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThan(0);
    expect(chart.aspects.length).toBeGreaterThan(5);
  });

  it('Albert Einstein (14 Mart 1879, 11:30 LMT Ulm) — yayınlanmış değerlere yakın', () => {
    // Ulm 10°00'E → LMT = UTC+0:40 → 10:50 UTC
    const chart = computeNatalChart({
      year: 1879,
      month: 3,
      day: 14,
      hour: 10,
      minute: 50,
      timeZone: 'UTC',
      location: { lat: 48.4, lng: 10.0 },
    });
    const sun = findBody(chart, 'sun')!;
    const moon = findBody(chart, 'moon')!;
    const asc = findBody(chart, 'asc')!;
    // Yayınlanan: Güneş 23°30' Balık, Ay 14°32' Yay, ASC 11°39' Yengeç
    expect(angularDistance(sun.longitude, 330 + 23.5)).toBeLessThan(0.3);
    expect(angularDistance(moon.longitude, 240 + 14.53)).toBeLessThan(0.6);
    expect(angularDistance(asc.longitude, 90 + 11.65)).toBeLessThan(1.5);
  });

  it('gece doğumu → gece Şans Noktası formülü', () => {
    const chart = computeNatalChart({ ...sample, hour: 2, minute: 0 });
    expect(chart.meta.isDayChart).toBe(false);
    const sun = findBody(chart, 'sun')!;
    const moon = findBody(chart, 'moon')!;
    const fortune = findBody(chart, 'fortune')!;
    expect(angularDistance(fortune.longitude, chart.houses.asc + sun.longitude - moon.longitude)).toBeLessThan(1e-6);
  });

  it('ev sistemi seçeneği uygulanır', () => {
    const chart = computeNatalChart(sample, { houseSystem: 'whole' });
    expect(chart.houses.system).toBe('whole');
    expect(chart.houses.cusps[0] % 30).toBeCloseTo(0, 9);
  });
});

/* ------------------------------------------------------------------ */
describe('chiron tablosu', () => {
  it('interpolasyon kaynak efemerisle 0.002° içinde uyuşur (1900–2100)', () => {
    // Tablo örnekleme noktalarına düşmeyen rastgele anlar
    const dates = [
      Date.UTC(1923, 9, 29, 9, 5),
      Date.UTC(1955, 1, 24, 23, 59),
      Date.UTC(1977, 10, 1, 3, 3),
      Date.UTC(1990, 5, 15, 11, 30),
      Date.UTC(2007, 6, 7, 7, 7),
      Date.UTC(2024, 0, 1, 12, 34),
      Date.UTC(2061, 3, 12, 18, 0),
      Date.UTC(2099, 11, 30, 5, 0),
    ];
    for (const ms of dates) {
      const t = makeTime(new Date(ms));
      const eps = trueObliquity(t);
      const ours = chironPosition(t, eps);
      const dateTT = new Date(ms + (t.tt - t.ut) * 86400000);
      const ref = getPlanet('chiron', dateTT, 0, 0, 0).observed.chiron.apparentLongitudeDd;
      expect(angularDistance(ours.longitude, ref), new Date(ms).toISOString()).toBeLessThan(0.002);
    }
    expect(CHIRON_RANGE.start.getUTCFullYear()).toBe(1900);
    expect(CHIRON_RANGE.end.getUTCFullYear()).toBeGreaterThanOrEqual(2099);
  });

  it('retro dönemi doğru: Chiron 2023 Ağustos–Aralık retro', () => {
    const t = makeTime(new Date(Date.UTC(2023, 9, 15)));
    expect(chironPosition(t, trueObliquity(t)).speed).toBeLessThan(0);
    const t2 = makeTime(new Date(Date.UTC(2024, 2, 15)));
    expect(chironPosition(t2, trueObliquity(t2)).speed).toBeGreaterThan(0);
  });
});
