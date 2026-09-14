/**
 * Claude'a gönderilecek istemler. Harita verisi kompakt metin olarak
 * serileştirilir; sistem istemi sabittir (prompt cache için).
 */
import { ASPECTS, BODIES, ELEMENT_NAMES, HOUSE_NAMES, HOUSE_SYSTEM_NAMES, MODALITY_NAMES, SIGNS } from '@/astro/constants';
import { DIGNITY_NAMES } from '@/astro/dignities';
import { formatDegMin } from '@/astro/format';
import { SYNASTRY_CATEGORY_NAMES } from '@/astro/synastry';
import { formatLocal } from '@/astro/time';
import type { Aspect, BodyPosition, NatalChart, SynastryReport, TransitReport } from '@/astro/types';

import type { InterpretationKind } from './promptText';

export { buildUserPrompt, SYSTEM_PROMPT, type InterpretationKind } from './promptText';
export { THEMES, THEME_ORDER, type InterpretationTheme, type ThemeInfo } from './themes';

function body(p: BodyPosition): string {
  const retro = p.retrograde ? ' (retro)' : '';
  return `${BODIES[p.id].name}: ${formatDegMin(p.longitude)} ${SIGNS[p.sign].name}, ${p.house}. ev${retro}`;
}

function aspect(a: Aspect): string {
  return `${BODIES[a.a].name} ${ASPECTS[a.type].name.toLowerCase()} ${BODIES[a.b].name} (orb ${Math.abs(a.orb).toFixed(1)}°, ${a.applying ? 'yaklaşan' : 'uzaklaşan'})`;
}

/** Natal haritayı kompakt metne çevirir */
export function serializeChart(chart: NatalChart, label = 'Doğum Haritası'): string {
  const { input, meta, houses } = chart;
  const lines: string[] = [];
  lines.push(`# ${label}${input.name ? ` — ${input.name}` : ''}`);
  lines.push(
    `Doğum: ${formatLocal(meta.utc, meta.timeZone, !input.timeUnknown)}${input.timeUnknown ? ' (saat bilinmiyor, öğlen varsayıldı — ASC ve evler güvenilmez)' : ''}, ${input.placeName ?? `${input.location.lat.toFixed(2)}, ${input.location.lng.toFixed(2)}`}`,
  );
  lines.push(`Ev sistemi: ${HOUSE_SYSTEM_NAMES[houses.system]}${houses.fallbackFrom ? ` (${HOUSE_SYSTEM_NAMES[houses.fallbackFrom]} kutup enlemi nedeniyle çözülemedi)` : ''}. ${meta.isDayChart ? 'Gündüz' : 'Gece'} doğumu.`);
  lines.push('');
  lines.push('## Gezegenler');
  for (const p of chart.planets) lines.push(`- ${body(p)}`);
  lines.push('');
  lines.push('## Noktalar');
  for (const p of chart.points) lines.push(`- ${BODIES[p.id].name}: ${formatDegMin(p.longitude)} ${SIGNS[p.sign].name}`);
  lines.push('');
  lines.push('## Ev başlangıçları');
  houses.cusps.forEach((c, i) => {
    const sign = Math.floor(c / 30) % 12;
    lines.push(`- ${i + 1}. ev (${HOUSE_NAMES[i]}): ${formatDegMin(c)} ${SIGNS[sign].name}`);
  });
  lines.push('');
  lines.push('## Açılar (orb küçükten büyüğe)');
  for (const a of chart.aspects) lines.push(`- ${aspect(a)}`);
  lines.push('');
  const e = chart.elements;
  const m = chart.modalities;
  lines.push(
    `## Dengeler\nElementler: ${(Object.keys(e) as (keyof typeof e)[]).map((k) => `${ELEMENT_NAMES[k]} ${e[k].toFixed(1)}`).join(', ')}\nNitelikler: ${(Object.keys(m) as (keyof typeof m)[]).map((k) => `${MODALITY_NAMES[k]} ${m[k].toFixed(1)}`).join(', ')}`,
  );
  if (chart.dignities.length) {
    lines.push(`Onurlar: ${chart.dignities.map((d) => `${BODIES[d.body].name} — ${DIGNITY_NAMES[d.kind]}`).join('; ')}`);
  }
  return lines.join('\n');
}

/**
 * Seçilen tarihe göre gökyüzü. `from` verilirse (öngörü) modele tarihin
 * bugünden ne kadar uzak olduğu da söylenir; böylece hızlı cisimlere
 * gereğinden fazla anlam yüklemez.
 */
export function serializeTransits(report: TransitReport, natal: NatalChart, from?: Date): string {
  const lines: string[] = [];
  lines.push(`# Transitler — ${formatLocal(report.date, natal.meta.timeZone)}`);
  if (from) {
    const days = Math.round((report.date.getTime() - from.getTime()) / 86400000);
    const abs = Math.abs(days);
    const when =
      abs < 1
        ? 'bugün'
        : abs < 45
          ? `bugünden ${abs} gün ${days > 0 ? 'sonra' : 'önce'}`
          : abs < 400
            ? `bugünden yaklaşık ${Math.round(abs / 30)} ay ${days > 0 ? 'sonra' : 'önce'}`
            : `bugünden yaklaşık ${(abs / 365.25).toFixed(1)} yıl ${days > 0 ? 'sonra' : 'önce'}`;
    lines.push(`Bu tarih ${when}.${abs >= 45 ? ' Ay ve diğer hızlı cisimler yalnızca o güne aittir; dönemi yavaş gezegenler tanımlar.' : ''}`);
  }
  lines.push(`Ay evresi: ${report.moonPhase.name} (${Math.round(report.moonPhase.illumination * 100)}% aydınlık), Ay ${SIGNS[report.moonPhase.sign].name} burcunda`);
  if (report.retrogrades.length) lines.push(`Retro gezegenler: ${report.retrogrades.map((id) => BODIES[id].name).join(', ')}`);
  lines.push('');
  lines.push('## Transit konumları (natal evlere göre)');
  for (const p of report.transitPositions) lines.push(`- ${body(p)}`);
  lines.push('');
  lines.push('## Transit → natal açılar (orb küçükten büyüğe)');
  for (const a of report.aspects.slice(0, 25)) {
    lines.push(`- Transit ${BODIES[a.transitBody].name} ${ASPECTS[a.type].name.toLowerCase()} natal ${BODIES[a.natalBody].name} (orb ${Math.abs(a.orb).toFixed(1)}°, ${a.applying ? 'yaklaşan' : 'uzaklaşan'}; transit ${a.transitHouse}. evde)`);
  }
  return lines.join('\n');
}

export function serializeSynastry(a: NatalChart, b: NatalChart, report: SynastryReport): string {
  const nameA = a.input.name || 'A';
  const nameB = b.input.name || 'B';
  const lines: string[] = [];
  lines.push(`# Sinastri — ${nameA} & ${nameB}`);
  lines.push(`Genel uyum skoru: ${report.score}/100`);
  lines.push(
    (Object.keys(report.categories) as (keyof typeof report.categories)[])
      .map((k) => `${SYNASTRY_CATEGORY_NAMES[k]}: ${report.categories[k]}`)
      .join(', '),
  );
  lines.push('');
  lines.push(`## ${nameA}'nın gezegenleri ${nameB}'nin evlerinde`);
  for (const [id, h] of Object.entries(report.housesAinB)) lines.push(`- ${BODIES[id as keyof typeof BODIES].name}: ${h}. ev`);
  lines.push('');
  lines.push(`## ${nameB}'nin gezegenleri ${nameA}'nın evlerinde`);
  for (const [id, h] of Object.entries(report.housesBinA)) lines.push(`- ${BODIES[id as keyof typeof BODIES].name}: ${h}. ev`);
  lines.push('');
  lines.push('## Karşılıklı açılar (orb küçükten büyüğe)');
  for (const x of report.aspects.slice(0, 30)) {
    lines.push(`- ${nameA} ${BODIES[x.personA].name} ${ASPECTS[x.type].name.toLowerCase()} ${nameB} ${BODIES[x.personB].name} (orb ${Math.abs(x.orb).toFixed(1)}°)`);
  }
  return lines.join('\n');
}

/** Yorum önbelleği için anahtar (harita değişince değişir) */
export function interpretationKey(kind: InterpretationKind, ids: string[], data: string): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) h = (h * 31 + data.charCodeAt(i)) | 0;
  return `${kind}:${ids.join(':')}:${(h >>> 0).toString(36)}`;
}
