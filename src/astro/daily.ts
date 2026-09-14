/**
 * Günün özeti — "kozmik nabız", güçlü yanlar ve dikkat edilecekler.
 *
 * Metinler yapay zekâ ile değil, o günün gerçek transitlerinden üretilir:
 * uygulama her açıldığında istek atılmaz, çevrimdışı çalışır ve aynı gün
 * aynı sonucu verir. Ayrıntılı yorum ayrı bir özelliktir (src/ai/).
 *
 * Dile bağlı metinler `dailyText.ts` içindedir; burada yalnızca seçim
 * mantığı vardır. Saf TypeScript: React Native'e bağımlı değildir.
 */
import type { Locale } from '@/i18n/locales';

import { ASPECTS } from './constants';
import { dailyText, type Nature, type Voice } from './dailyText';
import { astroText } from './i18n';
import type { BodyId, TransitAspect, TransitReport } from './types';

export interface BriefItem {
  /** Kısa başlık */
  title: string;
  /** Bir cümlelik açıklama */
  text: string;
  /** Hangi transitten türedi — arayüzde küçük not */
  source: string;
}

export interface DailyBrief {
  /** Günün motivasyon cümlesi */
  pulse: string;
  /** Nabzın dayandığı transit */
  pulseSource: string;
  /** Nabzı belirleyen transit gezegeni — günün görselini de bu belirler */
  pulseBody: BodyId | null;
  /** Yerel takvim gününün sıra numarası; görsel seçiminde kullanılır */
  day: number;
  strengths: BriefItem[];
  cautions: BriefItem[];
  /** 0–100 enerji seviyesi: uyumlu ve zorlayıcı açıların dengesi */
  energy: number;
  /** Ay'ın durumu tek satırda */
  moonLine: string;
}

/** Yerel takvim gününün sıra numarası — cümle ve görsel seçiminde kullanılır */
export function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/**
 * Transit gezegenin günün temasındaki ağırlığı. Ay her gün her açıyı
 * yaptığı için düşük; yavaş gezegenler günü daha çok belirler.
 */
const TRANSIT_WEIGHT: Partial<Record<BodyId, number>> = {
  moon: 0.6,
  sun: 1.1,
  mercury: 0.9,
  venus: 1,
  mars: 1.1,
  jupiter: 1.3,
  saturn: 1.3,
  uranus: 1.2,
  neptune: 1.1,
  pluto: 1.3,
  chiron: 1,
  northNode: 1.1,
};

/** Natal noktanın kişisel ağırlığı */
const NATAL_WEIGHT: Partial<Record<BodyId, number>> = {
  sun: 1.3,
  moon: 1.3,
  asc: 1.3,
  mc: 1.25,
  mercury: 1.15,
  venus: 1.15,
  mars: 1.15,
};

function natureOf(a: TransitAspect): Nature {
  const n = ASPECTS[a.type].nature;
  return n === 'harmonious' || n === 'tense' ? n : 'neutral';
}

function weightOf(a: TransitAspect): number {
  return a.strength * (TRANSIT_WEIGHT[a.transitBody] ?? 1) * (NATAL_WEIGHT[a.natalBody] ?? 1);
}

/**
 * Enerji seviyesi: uyumlu ve zorlayıcı açıların ağırlıklı dengesi.
 * 50 nötr; hiç açı yoksa 50 döner.
 */
export function energyLevel(aspects: TransitAspect[]): number {
  let pos = 0;
  let neg = 0;
  for (const a of aspects) {
    const w = weightOf(a);
    const n = natureOf(a);
    if (n === 'harmonious') pos += w;
    else if (n === 'tense') neg += w;
    else pos += w * 0.35; // kavuşum: yönü açı değil, gezegen belirler
  }
  const total = pos + neg;
  if (total === 0) return 50;
  const raw = 50 + 45 * ((pos - neg) / total);
  return Math.round(Math.max(12, Math.min(98, raw)));
}

/**
 * Günün özetini üretir. Aynı rapor ve dil için her zaman aynı sonucu
 * döndürür — rastgelelik yoktur, metin o günün en belirleyici
 * transitlerinden seçilir.
 */
export function buildDailyBrief(report: TransitReport, locale: Locale): DailyBrief {
  const text = dailyText(locale);
  const astro = astroText(locale);
  const bodyName = (id: BodyId) => astro.bodies[id];
  const voiceOf = (a: TransitAspect): Voice | undefined => text.voices[a.transitBody]?.[natureOf(a)];
  const sourceOf = (a: TransitAspect) => text.source(bodyName(a.transitBody), bodyName(a.natalBody), astro.aspects[a.type]);

  // Metin tablosunda karşılığı olan açılar, ağırlığa göre sıralı
  const ranked = report.aspects
    .filter((a) => voiceOf(a) !== undefined && text.areas[a.natalBody] !== undefined)
    .map((a) => ({ a, w: weightOf(a) }))
    .sort((x, y) => y.w - x.w || x.a.transitBody.localeCompare(y.a.transitBody));

  const day = dayNumber(report.date);
  const top = ranked[0]?.a;
  // Aynı transit birkaç gün sürebilir; cümle gün numarasına göre dönüyor ki
  // her sabah aynı şeyi okumayasın.
  const pulses = top ? voiceOf(top)!.pulses : text.fallbackPulses;
  const pulse = pulses[((day % pulses.length) + pulses.length) % pulses.length];

  const itemFrom = (a: TransitAspect, kind: 'strength' | 'caution'): BriefItem | null => {
    const voice = voiceOf(a);
    const area = text.areas[a.natalBody];
    if (!voice || !area) return null;
    const house = astro.houses[a.transitHouse - 1];
    const lead = kind === 'strength' ? text.strengthLead(area) : text.cautionLead(area);
    return {
      title: voice.title,
      text: lead + (house ? text.where(a.transitHouse, house) : ''),
      source: sourceOf(a),
    };
  };

  /**
   * Liste çeşitli kalsın diye hem transit gezegeni hem de dokunulan natal
   * nokta bir kez kullanılır. Natal nokta tekrar ederse madde metni birebir
   * aynı çıkıyor — yalnızca başlık değişiyor, okuyan hata sanıyor.
   */
  const pick = (want: Nature, limit: number): BriefItem[] => {
    const usedTransit = new Set<BodyId>();
    const usedNatal = new Set<BodyId>();
    const out: BriefItem[] = [];
    for (const { a } of ranked) {
      if (out.length >= limit) break;
      if (natureOf(a) !== want) continue;
      if (usedTransit.has(a.transitBody) || usedNatal.has(a.natalBody)) continue;
      const item = itemFrom(a, want === 'tense' ? 'caution' : 'strength');
      if (!item) continue;
      usedTransit.add(a.transitBody);
      usedNatal.add(a.natalBody);
      out.push(item);
    }
    return out;
  };

  const phase = report.moonPhase;

  return {
    pulse,
    pulseSource: top ? sourceOf(top) : text.noAspect,
    pulseBody: top?.transitBody ?? null,
    day,
    strengths: pick('harmonious', 3),
    cautions: pick('tense', 2),
    energy: energyLevel(report.aspects),
    moonLine: text.moonLine(astro.signs[phase.sign], astro.moonPhases[phase.index], Math.round(phase.illumination * 100)),
  };
}
