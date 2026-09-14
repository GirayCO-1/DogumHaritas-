import { describe, expect, it } from 'vitest';

import { ASTRO_TEXT } from '../../src/astro/i18n';
import { DAILY_TEXT } from '../../src/astro/dailyText';
import { LOCALES, LOCALE_ORDER, matchLocale } from '../../src/i18n/locales';
import { MESSAGES } from '../../src/i18n/messages';
import type { Locale } from '../../src/i18n/locales';

/** İç içe nesnenin tüm yaprak yollarını çıkarır */
function paths(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [prefix];
  if (Array.isArray(obj)) return [`${prefix}[${obj.length}]`];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    paths(v, prefix ? `${prefix}.${k}` : k),
  );
}

const REFERENCE: Locale = 'tr';
const OTHERS = LOCALE_ORDER.filter((l) => l !== REFERENCE);

describe('dil katmanı eksiksiz', () => {
  it('beş dil tanımlı ve hepsinin kendi adı var', () => {
    expect(LOCALE_ORDER).toHaveLength(5);
    for (const code of LOCALE_ORDER) {
      expect(LOCALES[code].name.length).toBeGreaterThan(1);
      expect(LOCALES[code].tag).toContain(code);
    }
    expect(LOCALES.ar.rtl).toBe(true);
  });

  it.each(OTHERS)('%s arayüz kataloğu Türkçe ile birebir aynı yapıda', (code) => {
    expect(paths(MESSAGES[code]).sort()).toEqual(paths(MESSAGES[REFERENCE]).sort());
  });

  it.each(OTHERS)('%s astroloji terimleri eksiksiz', (code) => {
    expect(paths(ASTRO_TEXT[code]).sort()).toEqual(paths(ASTRO_TEXT[REFERENCE]).sort());
  });

  it.each(OTHERS)('%s günlük metinleri eksiksiz', (code) => {
    expect(paths(DAILY_TEXT[code]).sort()).toEqual(paths(DAILY_TEXT[REFERENCE]).sort());
  });

  it.each(LOCALE_ORDER)('%s hiçbir dizgeyi boş bırakmıyor', (code) => {
    const empty: string[] = [];
    const walk = (obj: unknown, prefix: string) => {
      if (typeof obj === 'string') {
        if (!obj.trim()) empty.push(prefix);
        return;
      }
      if (Array.isArray(obj)) return obj.forEach((v, i) => walk(v, `${prefix}[${i}]`));
      if (obj && typeof obj === 'object') {
        for (const [k, v] of Object.entries(obj)) walk(v, `${prefix}.${k}`);
      }
    };
    walk(ASTRO_TEXT[code], 'astro');
    walk(DAILY_TEXT[code], 'daily');
    walk(MESSAGES[code], 'ui');
    expect(empty).toEqual([]);
  });

  it.each(LOCALE_ORDER)('%s günlük metinleri 12 gezegen × 3 doğa × 3 cümle taşıyor', (code) => {
    const voices = DAILY_TEXT[code].voices;
    expect(Object.keys(voices)).toHaveLength(12);
    for (const [body, natures] of Object.entries(voices)) {
      expect(Object.keys(natures!), body).toEqual(['harmonious', 'tense', 'neutral']);
      for (const [nature, v] of Object.entries(natures!)) {
        expect(v.pulses, `${code}/${body}/${nature}`).toHaveLength(3);
        expect(new Set(v.pulses).size, `${code}/${body}/${nature} tekrar`).toBe(3);
        expect(v.title.length).toBeGreaterThan(1);
      }
    }
  });

  it.each(LOCALE_ORDER)('%s astroloji listeleri doğru uzunlukta', (code) => {
    expect(ASTRO_TEXT[code].signs).toHaveLength(12);
    expect(ASTRO_TEXT[code].houses).toHaveLength(12);
    expect(ASTRO_TEXT[code].moonPhases).toHaveLength(8);
  });

  it('cihaz dilini eşler, bilinmeyeni İngilizce’ye düşürür', () => {
    expect(matchLocale(['tr-TR'])).toBe('tr');
    expect(matchLocale(['de-AT', 'en-US'])).toBe('de');
    expect(matchLocale(['ar-EG'])).toBe('ar');
    expect(matchLocale(['ja-JP'])).toBe('en');
    expect(matchLocale([])).toBe('en');
  });

  it('cümle kalıpları değişkeni gerçekten yerleştiriyor', () => {
    for (const code of LOCALE_ORDER) {
      const d = DAILY_TEXT[code];
      expect(d.strengthLead('XYZ')).toContain('XYZ');
      expect(d.cautionLead('XYZ')).toContain('XYZ');
      expect(d.where(7, 'HOUSE')).toContain('HOUSE');
      expect(d.where(7, 'HOUSE')).toContain('7');
      expect(d.source('A', 'B', 'C')).toContain('A');
      expect(d.moonLine('S', 'P', 42)).toContain('42');
      expect(MESSAGES[code].home.greeting('Ada')).toContain('Ada');
      expect(MESSAGES[code].people.count(3)).toContain('3');
    }
  });
});
