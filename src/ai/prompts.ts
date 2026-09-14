/**
 * Claude'a gönderilecek istemler.
 *
 * Harita verisi kullanıcının dilinden bağımsız olarak İNGİLİZCE
 * serileştirilir: model astroloji terminolojisini bu dilde en sağlam bilir,
 * tek bir veri biçimi istem önbelleğini bozmaz ve hata ayıklamayı
 * kolaylaştırır. Yanıtın hangi dilde yazılacağı sistem isteminde ayrıca
 * belirtilir (bkz. promptText.ts).
 */
import { astroText } from '@/astro/i18n';
import { formatDegMin } from '@/astro/format';
import { SYNASTRY_CATEGORIES } from '@/astro/synastry';
import { formatLocal } from '@/astro/time';
import type { Aspect, BodyId, BodyPosition, NatalChart, SynastryReport, TransitReport } from '@/astro/types';

import type { InterpretationKind } from './promptText';

/** Harita verisi her zaman İngilizce terimlerle yazılır */
const T = astroText('en');

export { buildUserPrompt, systemPrompt, type InterpretationKind } from './promptText';
export { THEMES, THEME_ORDER, type InterpretationTheme, type ThemeInfo } from './themes';

function body(p: BodyPosition): string {
  const retro = p.retrograde ? ' (retrograde)' : '';
  return `${T.bodies[p.id]}: ${formatDegMin(p.longitude)} ${T.signs[p.sign]}, house ${p.house}${retro}`;
}

function aspect(a: Aspect): string {
  return `${T.bodies[a.a]} ${T.aspects[a.type].toLowerCase()} ${T.bodies[a.b]} (orb ${Math.abs(a.orb).toFixed(1)}°, ${a.applying ? 'applying' : 'separating'})`;
}

/** Natal haritayı kompakt metne çevirir */
export function serializeChart(chart: NatalChart, label = 'Natal Chart'): string {
  const { input, meta, houses } = chart;
  const lines: string[] = [];
  lines.push(`# ${label}${input.name ? ` — ${input.name}` : ''}`);
  lines.push(
    `Born: ${formatLocal(meta.utc, meta.timeZone, !input.timeUnknown)}${input.timeUnknown ? ' (birth time unknown, noon assumed — ASC and houses unreliable)' : ''}, ${input.placeName ?? `${input.location.lat.toFixed(2)}, ${input.location.lng.toFixed(2)}`}`,
  );
  lines.push(`House system: ${T.houseSystems[houses.system]}${houses.fallbackFrom ? ` (${T.houseSystems[houses.fallbackFrom]} could not be resolved at this polar latitude)` : ''}. ${meta.isDayChart ? 'Day' : 'Night'} chart.`);
  lines.push('');
  lines.push('## Planets');
  for (const p of chart.planets) lines.push(`- ${body(p)}`);
  lines.push('');
  lines.push('## Points');
  for (const p of chart.points) lines.push(`- ${T.bodies[p.id]}: ${formatDegMin(p.longitude)} ${T.signs[p.sign]}`);
  lines.push('');
  lines.push('## House cusps');
  houses.cusps.forEach((c, i) => {
    const sign = Math.floor(c / 30) % 12;
    lines.push(`- House ${i + 1} (${T.houses[i]}): ${formatDegMin(c)} ${T.signs[sign]}`);
  });
  lines.push('');
  lines.push('## Aspects (tightest orb first)');
  for (const a of chart.aspects) lines.push(`- ${aspect(a)}`);
  lines.push('');
  const e = chart.elements;
  const m = chart.modalities;
  lines.push(
    `## Balances\nElements: ${(Object.keys(e) as (keyof typeof e)[]).map((k) => `${T.elements[k]} ${e[k].toFixed(1)}`).join(', ')}\nModalities: ${(Object.keys(m) as (keyof typeof m)[]).map((k) => `${T.modalities[k]} ${m[k].toFixed(1)}`).join(', ')}`,
  );
  if (chart.dignities.length) {
    lines.push(`Dignities: ${chart.dignities.map((d) => `${T.bodies[d.body]} — ${T.dignities[d.kind]}`).join('; ')}`);
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
  lines.push(`# Transits — ${formatLocal(report.date, natal.meta.timeZone)}`);
  if (from) {
    const days = Math.round((report.date.getTime() - from.getTime()) / 86400000);
    const abs = Math.abs(days);
    const dir = days > 0 ? 'from now' : 'ago';
    const when =
      abs < 1
        ? 'today'
        : abs < 45
          ? `${abs} days ${dir}`
          : abs < 400
            ? `about ${Math.round(abs / 30)} months ${dir}`
            : `about ${(abs / 365.25).toFixed(1)} years ${dir}`;
    lines.push(`This date is ${when}.${abs >= 45 ? ' The Moon and other fast bodies describe only that single day; the period itself is defined by the slow planets.' : ''}`);
  }
  lines.push(`Moon phase: ${T.moonPhases[report.moonPhase.index]} (${Math.round(report.moonPhase.illumination * 100)}% illuminated), Moon in ${T.signs[report.moonPhase.sign]}`);
  if (report.retrogrades.length) lines.push(`Retrograde planets: ${report.retrogrades.map((id) => T.bodies[id]).join(', ')}`);
  lines.push('');
  lines.push('## Transiting positions (by natal house)');
  for (const p of report.transitPositions) lines.push(`- ${body(p)}`);
  lines.push('');
  lines.push('## Transit → natal aspects (tightest orb first)');
  for (const a of report.aspects.slice(0, 25)) {
    lines.push(`- Transiting ${T.bodies[a.transitBody]} ${T.aspects[a.type].toLowerCase()} natal ${T.bodies[a.natalBody]} (orb ${Math.abs(a.orb).toFixed(1)}°, ${a.applying ? 'applying' : 'separating'}; transiting body in house ${a.transitHouse})`);
  }
  return lines.join('\n');
}

export function serializeSynastry(a: NatalChart, b: NatalChart, report: SynastryReport): string {
  const nameA = a.input.name || 'A';
  const nameB = b.input.name || 'B';
  const lines: string[] = [];
  lines.push(`# Synastry — ${nameA} & ${nameB}`);
  lines.push(`Overall compatibility score: ${report.score}/100`);
  lines.push(SYNASTRY_CATEGORIES.map((k) => `${T.synastryCategories[k]}: ${report.categories[k]}`).join(', '));
  lines.push('');
  lines.push(`## ${nameA}'s planets in ${nameB}'s houses`);
  for (const [id, h] of Object.entries(report.housesAinB)) lines.push(`- ${T.bodies[id as BodyId]}: house ${h}`);
  lines.push('');
  lines.push(`## ${nameB}'s planets in ${nameA}'s houses`);
  for (const [id, h] of Object.entries(report.housesBinA)) lines.push(`- ${T.bodies[id as BodyId]}: house ${h}`);
  lines.push('');
  lines.push('## Mutual aspects (tightest orb first)');
  for (const x of report.aspects.slice(0, 30)) {
    lines.push(`- ${nameA} ${T.bodies[x.personA]} ${T.aspects[x.type].toLowerCase()} ${nameB} ${T.bodies[x.personB]} (orb ${Math.abs(x.orb).toFixed(1)}°)`);
  }
  return lines.join('\n');
}

/** Yorum önbelleği için anahtar (harita değişince değişir) */
export function interpretationKey(kind: InterpretationKind, ids: string[], data: string): string {
  let h = 0;
  for (let i = 0; i < data.length; i++) h = (h * 31 + data.charCodeAt(i)) | 0;
  return `${kind}:${ids.join(':')}:${(h >>> 0).toString(36)}`;
}
