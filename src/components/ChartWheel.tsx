/**
 * Doğum haritası çarkı (SVG).
 *
 * Yerleşim: Yükselen solda (saat 9), boylam saat yönünün tersine artar.
 * Dıştan içe: [dış halka: transit/sinastri] → burç kuşağı → gezegenler →
 * ev numaraları → açı çizgileri.
 */
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { ASPECTS, SIGNS } from '@/astro/constants';
import { norm360, zodiacPosition } from '@/astro/math';
import type { Aspect, BodyId, BodyPosition, NatalChart } from '@/astro/types';
import { useAspectColors, useColors, useElementColors, type AspectPalette } from '@/constants/theme';

import { SvgBodyGlyph, SvgSignGlyph, useBodyColor, useSignColor } from './Glyph';

export interface ChartWheelProps {
  chart: NatalChart;
  /** Piksel cinsinden genişlik/yükseklik */
  size?: number;
  showAspects?: boolean;
  showMinor?: boolean;
  /** Çarkta gösterilecek cisimler */
  visibleBodies?: readonly BodyId[];
  /** Dış halkada gösterilecek konumlar (transit / diğer kişi) */
  outer?: BodyPosition[];
  outerLabel?: string;
  /** a = dış halka cismi, b = natal cisim */
  crossAspects?: Aspect[];
  selected?: BodyId | null;
  onSelect?: (id: BodyId | null) => void;
}

const DEFAULT_VISIBLE: readonly BodyId[] = [
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
  'lilith',
];

const S = 400; // mantıksal boyut (viewBox)
const C = S / 2;
const DEG = Math.PI / 180;

/** Ekrandaki açı (derece): Yükselen 180°, boylam arttıkça saat yönünün tersine */
function screenAngle(lon: number, asc: number): number {
  return 180 + (lon - asc);
}

function pt(lon: number, r: number, asc: number): { x: number; y: number } {
  const a = screenAngle(lon, asc) * DEG;
  return { x: C + r * Math.cos(a), y: C - r * Math.sin(a) };
}

/** Halka dilimi yolu (lon1 → lon2, saat yönünün tersine) */
function sectorPath(lon1: number, lon2: number, rOut: number, rIn: number, asc: number): string {
  const p1 = pt(lon1, rOut, asc);
  const p2 = pt(lon2, rOut, asc);
  const p3 = pt(lon2, rIn, asc);
  const p4 = pt(lon1, rIn, asc);
  const large = norm360(lon2 - lon1) > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 ${large} 0 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 ${large} 1 ${p4.x} ${p4.y} Z`;
}

/** Çakışan glifleri açısal olarak birbirinden uzaklaştırır */
function spread(lons: number[], minSep: number): number[] {
  const n = lons.length;
  if (n < 2) return lons.slice();
  const order = lons.map((lon, i) => ({ lon, i })).sort((a, b) => a.lon - b.lon);
  const disp = order.map((o) => o.lon);
  for (let iter = 0; iter < 40; iter++) {
    let moved = false;
    for (let k = 0; k < n; k++) {
      const j = (k + 1) % n;
      const gap = n === 1 ? 360 : norm360(disp[j] - disp[k]);
      if (gap < minSep - 1e-6) {
        const shift = (minSep - gap) / 2;
        disp[k] -= shift;
        disp[j] += shift;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const out = new Array<number>(n);
  order.forEach((o, k) => {
    out[o.i] = norm360(disp[k]);
  });
  return out;
}

function aspectStroke(a: Aspect, ac: AspectPalette) {
  const info = ASPECTS[a.type];
  const color =
    a.type === 'conjunction' ? ac.conjunction : info.nature === 'harmonious' ? ac.harmonious : info.nature === 'tense' ? ac.tense : ac.minor;
  return {
    color: info.major ? color : ac.minor,
    width: 0.6 + a.strength * 1.1,
    opacity: 0.3 + a.strength * 0.55,
    dash: info.major ? undefined : '3,3',
  };
}

export function ChartWheel({
  chart,
  size = 360,
  showAspects = true,
  showMinor = false,
  visibleBodies = DEFAULT_VISIBLE,
  outer,
  outerLabel,
  crossAspects,
  selected: selectedProp,
  onSelect,
}: ChartWheelProps) {
  const Colors = useColors();
  const ElementColors = useElementColors();
  const aspectColors = useAspectColors();
  const bodyColor = useBodyColor();
  const signColor = useSignColor();
  const [internalSel, setInternalSel] = useState<BodyId | null>(null);
  const selected = selectedProp !== undefined ? selectedProp : internalSel;
  const select = (id: BodyId | null) => {
    setInternalSel(id);
    onSelect?.(id);
  };

  const asc = chart.houses.asc;
  const hasOuter = !!outer && outer.length > 0;

  // Yarıçaplar
  // Dış halka yoksa köşe etiketleri (ASC/DSC) kuşağın dışına yazılır; kenara
  // taşmasınlar diye yarıçap o kadar daraltılır.
  const rZodOut = hasOuter ? 0.425 * S : 0.435 * S;
  const rZodIn = rZodOut - 0.082 * S;
  const rOuterGlyph = 0.468 * S;
  const rPlanet = rZodIn - 0.078 * S;
  const rInner = 0.245 * S;
  const rAsp = rInner - 0.05 * S;
  const glyph = 0.056 * S;
  const outerGlyph = 0.048 * S;

  const planets = useMemo(
    () => chart.planets.filter((p) => visibleBodies.includes(p.id)),
    [chart, visibleBodies],
  );

  const displayed = useMemo(() => {
    const minSep = ((glyph * 1.15) / rPlanet) * (180 / Math.PI);
    return spread(
      planets.map((p) => p.longitude),
      minSep,
    );
  }, [planets, glyph, rPlanet]);

  const outerDisplayed = useMemo(() => {
    if (!hasOuter) return [];
    const minSep = ((outerGlyph * 1.15) / rOuterGlyph) * (180 / Math.PI);
    return spread(
      outer!.map((p) => p.longitude),
      minSep,
    );
  }, [outer, hasOuter, outerGlyph, rOuterGlyph]);

  const lonOf = useMemo(() => {
    const m = new Map<BodyId, number>();
    for (const p of [...chart.planets, ...chart.points]) m.set(p.id, p.longitude);
    return m;
  }, [chart]);

  const outerLonOf = useMemo(() => {
    const m = new Map<BodyId, number>();
    for (const p of outer ?? []) m.set(p.id, p.longitude);
    return m;
  }, [outer]);

  const visibleSet = useMemo(() => new Set<BodyId>([...visibleBodies, 'asc', 'mc']), [visibleBodies]);

  const aspects = useMemo(
    () =>
      chart.aspects.filter(
        (a) => a.type !== 'conjunction' && (showMinor || ASPECTS[a.type].major) && visibleSet.has(a.a) && visibleSet.has(a.b),
      ),
    [chart.aspects, showMinor, visibleSet],
  );

  // Derece işaretleri tek bir path
  const ticks = useMemo(() => {
    let d = '';
    for (let deg = 0; deg < 360; deg++) {
      const len = deg % 10 === 0 ? 0.02 * S : deg % 5 === 0 ? 0.013 * S : 0.007 * S;
      const a = pt(deg, rZodIn, asc);
      const b = pt(deg, rZodIn + len, asc);
      d += `M ${a.x} ${a.y} L ${b.x} ${b.y} `;
    }
    return d;
  }, [asc, rZodIn]);

  const angleLabels: { id: BodyId; lon: number; text: string }[] = [
    { id: 'asc', lon: chart.houses.asc, text: 'ASC' },
    { id: 'mc', lon: chart.houses.mc, text: 'MC' },
    { id: 'dsc', lon: chart.houses.dsc, text: 'DSC' },
    { id: 'ic', lon: chart.houses.ic, text: 'IC' },
  ];

  const dimOthers = selected !== null;
  const involves = (a: Aspect) => a.a === selected || a.b === selected;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${S} ${S}`}>
        {/* Arka plan */}
        <Circle cx={C} cy={C} r={rZodOut} fill={Colors.sky} />

        {/* Burç kuşağı */}
        {SIGNS.map((s) => (
          <Path
            key={s.key}
            d={sectorPath(s.index * 30, s.index * 30 + 30, rZodOut, rZodIn, asc)}
            fill={ElementColors[s.element]}
            fillOpacity={Colors.scheme === 'light' ? 0.1 : 0.14}
            stroke={Colors.border}
            strokeWidth={0.8}
          />
        ))}
        {SIGNS.map((s) => {
          const p = pt(s.index * 30 + 15, (rZodOut + rZodIn) / 2, asc);
          return <SvgSignGlyph key={`g${s.key}`} sign={s.index} x={p.x} y={p.y} size={0.05 * S} color={signColor(s.index)} />;
        })}
        <Path d={ticks} stroke={Colors.textSecondary} strokeOpacity={0.55} strokeWidth={0.7} />

        {/* Ev çizgileri */}
        <Circle cx={C} cy={C} r={rInner} fill={Colors.card} stroke={Colors.border} strokeWidth={0.8} />
        <Circle cx={C} cy={C} r={rAsp} fill="none" stroke={Colors.border} strokeWidth={0.8} />
        {chart.houses.cusps.map((cusp, i) => {
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          const a = pt(cusp, rAsp, asc);
          const b = pt(cusp, rZodIn, asc);
          return (
            <Line
              key={`c${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={isAngle ? Colors.accent : Colors.textSecondary}
              strokeOpacity={isAngle ? 0.95 : 0.35}
              strokeWidth={isAngle ? 1.6 : 0.8}
            />
          );
        })}
        {/* Ev numaraları */}
        {chart.houses.cusps.map((cusp, i) => {
          const next = chart.houses.cusps[(i + 1) % 12];
          const mid = cusp + norm360(next - cusp) / 2;
          const p = pt(mid, (rInner + rAsp) / 2, asc);
          return (
            <SvgText key={`n${i}`} x={p.x} y={p.y} fill={Colors.muted} fontSize={0.026 * S} textAnchor="middle" alignmentBaseline="central">
              {i + 1}
            </SvgText>
          );
        })}

        {/* Açı çizgileri */}
        {showAspects &&
          aspects.map((a, idx) => {
            const la = lonOf.get(a.a);
            const lb = lonOf.get(a.b);
            if (la === undefined || lb === undefined) return null;
            const p1 = pt(la, rAsp, asc);
            const p2 = pt(lb, rAsp, asc);
            const st = aspectStroke(a, aspectColors);
            const dim = dimOthers && !involves(a);
            return (
              <Line
                key={`a${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={st.color}
                strokeWidth={dim ? 0.5 : st.width}
                strokeOpacity={dim ? 0.08 : st.opacity}
                strokeDasharray={st.dash}
              />
            );
          })}
        {showAspects &&
          crossAspects?.map((a, idx) => {
            const la = outerLonOf.get(a.a);
            const lb = lonOf.get(a.b);
            if (la === undefined || lb === undefined || a.type === 'conjunction') return null;
            const p1 = pt(la, rAsp, asc);
            const p2 = pt(lb, rAsp, asc);
            const st = aspectStroke(a, aspectColors);
            const dim = dimOthers && a.b !== selected;
            return (
              <Line
                key={`x${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={st.color}
                strokeWidth={dim ? 0.5 : st.width}
                strokeOpacity={dim ? 0.08 : st.opacity * 0.9}
                strokeDasharray="4,3"
              />
            );
          })}

        {/* Köşe etiketleri */}
        {angleLabels.map((l) => {
          const p = pt(l.lon, hasOuter ? rZodIn - 0.012 * S : rZodOut + 0.028 * S, asc);
          if (hasOuter && (l.id === 'dsc' || l.id === 'ic')) return null;
          return (
            <SvgText
              key={l.id}
              x={p.x}
              y={p.y}
              fill={l.id === 'asc' || l.id === 'mc' ? Colors.accent : Colors.muted}
              fontSize={0.026 * S}
              fontWeight="800"
              textAnchor="middle"
              alignmentBaseline="central">
              {l.text}
            </SvgText>
          );
        })}

        {/* Gezegenler */}
        {planets.map((p, i) => {
          const disp = displayed[i];
          const tickA = pt(p.longitude, rZodIn, asc);
          const tickB = pt(p.longitude, rZodIn - 0.018 * S, asc);
          const gpos = pt(disp, rPlanet, asc);
          const link = pt(disp, rPlanet + glyph * 0.62, asc);
          const dpos = pt(disp, rPlanet - glyph * 0.85, asc);
          const z = zodiacPosition(p.longitude);
          const isSel = selected === p.id;
          const dim = dimOthers && !isSel && !aspects.some((a) => involves(a) && (a.a === p.id || a.b === p.id));
          const color = bodyColor(p.id);
          return (
            <G key={p.id} onPress={() => select(isSel ? null : p.id)} opacity={dim ? 0.35 : 1}>
              <Line x1={tickA.x} y1={tickA.y} x2={tickB.x} y2={tickB.y} stroke={color} strokeWidth={1.4} />
              <Line x1={tickB.x} y1={tickB.y} x2={link.x} y2={link.y} stroke={color} strokeOpacity={0.45} strokeWidth={0.7} />
              {isSel && <Circle cx={gpos.x} cy={gpos.y} r={glyph * 0.72} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1} />}
              {/* dokunma alanı */}
              <Circle cx={gpos.x} cy={gpos.y} r={glyph * 0.8} fill="transparent" />
              <SvgBodyGlyph id={p.id} x={gpos.x} y={gpos.y} size={glyph} color={color} />
              <SvgText x={dpos.x} y={dpos.y} fill={Colors.textSecondary} fontSize={0.024 * S} textAnchor="middle" alignmentBaseline="central">
                {`${z.deg}°${p.retrograde ? '℞' : ''}`}
              </SvgText>
            </G>
          );
        })}

        {/* Dış halka (transit / sinastri) */}
        {hasOuter &&
          outer!.map((p, i) => {
            const disp = outerDisplayed[i];
            const tickA = pt(p.longitude, rZodOut, asc);
            const tickB = pt(p.longitude, rZodOut + 0.014 * S, asc);
            const gpos = pt(disp, rOuterGlyph, asc);
            const color = bodyColor(p.id);
            return (
              <G key={`o${p.id}`} opacity={0.95}>
                <Line x1={tickA.x} y1={tickA.y} x2={tickB.x} y2={tickB.y} stroke={color} strokeWidth={1.4} />
                <SvgBodyGlyph id={p.id} x={gpos.x} y={gpos.y} size={outerGlyph} color={color} />
              </G>
            );
          })}
        {hasOuter && outerLabel ? (
          <SvgText x={C} y={S - 4} fill={Colors.muted} fontSize={0.024 * S} textAnchor="middle">
            {outerLabel}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}
