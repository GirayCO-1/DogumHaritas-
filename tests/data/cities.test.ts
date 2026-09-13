import { describe, expect, it } from 'vitest';

import { cityCount, cityLabel, normalizeText, popularCities, searchCities } from '../../src/data/cities';

describe('şehir arama', () => {
  it('normalize: Türkçe karakterler ve büyük İ/ı', () => {
    expect(normalizeText('İstanbul')).toBe('istanbul');
    expect(normalizeText('IĞDIR')).toBe('igdir');
    expect(normalizeText('Şanlıurfa')).toBe('sanliurfa');
    expect(normalizeText('Çanakkale')).toBe('canakkale');
    expect(normalizeText('Kâğıthane')).toBe('kagithane');
  });

  it('Kadıköy → İstanbul ilçesi ilk sırada (Yalova köyü değil)', () => {
    const r = searchCities('Kadıköy');
    expect(r.length).toBeGreaterThan(0);
    expect(r[0].admin).toBe('İstanbul');
    expect(r[0].timeZone).toBe('Europe/Istanbul');
    expect(cityLabel(r[0])).toBe('Kadıköy, İstanbul, Türkiye');
  });

  it('diakritiksiz yazım da bulur: kadikoy, istanbul, izmir', () => {
    expect(searchCities('kadikoy')[0].admin).toBe('İstanbul');
    expect(searchCities('istanbul')[0].name).toBe('İstanbul');
    expect(searchCities('izmir')[0].name).toBe('İzmir');
  });

  it('büyük ilçeler mevcut: Beşiktaş, Çankaya, Konak, Nilüfer', () => {
    for (const [q, prov] of [
      ['Beşiktaş', 'İstanbul'],
      ['Çankaya', 'Ankara'],
      ['Konak', 'İzmir'],
      ['Nilüfer', 'Bursa'],
    ]) {
      const r = searchCities(q);
      expect(r[0]?.admin, q).toBe(prov);
    }
  });

  it('"kadıköy istanbul" gibi iki kelimeli sorgu ili doğrular', () => {
    const r = searchCities('kadıköy yalova');
    expect(r[0].admin).toBe('Yalova');
  });

  it('dünya şehirleri ve saat dilimleri', () => {
    expect(searchCities('Berlin')[0].timeZone).toBe('Europe/Berlin');
    expect(searchCities('New York')[0].timeZone).toBe('America/New_York');
    expect(searchCities('Tokyo')[0].timeZone).toBe('Asia/Tokyo');
    expect(searchCities('Londra').length + searchCities('London').length).toBeGreaterThan(0);
  });

  it('kısa sorgu boş döner, popüler liste TR ile başlar', () => {
    expect(searchCities('a')).toEqual([]);
    const pop = popularCities(5);
    expect(pop[0].name).toBe('İstanbul');
    expect(pop.every((c) => c.countryCode === 'TR')).toBe(true);
    expect(cityCount()).toBeGreaterThan(25000);
  });
});
