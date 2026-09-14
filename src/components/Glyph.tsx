/**
 * Gezegen ve burç sembolleri.
 * Unicode astroloji glifleri çoğu cihazda vardır; Chiron (⚷) ve Lilith (⚸)
 * bazı fontlarda eksik olduğu için SVG çarkında çizgi olarak çizilir.
 */
import { Text, type TextStyle } from 'react-native';
import { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { BODIES, SIGNS } from '@/astro/constants';
import type { BodyId } from '@/astro/types';
import { ElementColors, useColors, useScheme, type Palette, type Scheme } from '@/constants/theme';

/**
 * Gezegen renkleri her iki zeminde de okunaklı olmalı: koyu temadaki açık
 * tonlar beyaz üstünde kayboluyor, bu yüzden açık tema için ayrı bir dizi var.
 * Açılar (ASC/MC) paletin altın vurgusunu kullanır.
 */
const BODY_COLOR_SETS: Record<Scheme, Partial<Record<BodyId, string>>> = {
  light: {
    sun: '#C8891B',
    moon: '#5B6899',
    mercury: '#2E7BC4',
    venus: '#C1537F',
    mars: '#C24A34',
    jupiter: '#BC7522',
    saturn: '#7A6540',
    uranus: '#1D8A80',
    neptune: '#4260C4',
    pluto: '#7A4FB5',
    chiron: '#3C8A47',
    northNode: '#655CA6',
    southNode: '#8B84A3',
    lilith: '#514C75',
    fortune: '#2E8B6B',
  },
  dark: {
    sun: '#F5C451',
    moon: '#DDE3F5',
    mercury: '#9ED0F5',
    venus: '#F49AC1',
    mars: '#F26D5B',
    jupiter: '#F0A35E',
    saturn: '#C9B48A',
    uranus: '#7FE0D6',
    neptune: '#7C9DF5',
    pluto: '#B58CF5',
    chiron: '#9AD6A0',
    northNode: '#C8C3E8',
    southNode: '#8E8AA8',
    lilith: '#6E6A8F',
    fortune: '#5FD3A1',
  },
};

/** Paletten türeyen renkler (açılar) sabit dizide tutulamaz, burada eklenir */
export function bodyColorOf(id: BodyId, c: Palette): string {
  if (id === 'asc' || id === 'mc') return c.accent;
  if (id === 'dsc' || id === 'ic' || id === 'vertex') return c.muted;
  return BODY_COLOR_SETS[c.scheme][id] ?? c.text;
}

export function signColorOf(sign: number, scheme: Scheme): string {
  return ElementColors[scheme][SIGNS[sign].element];
}

/** Bileşen içinde renk seçiciyi hazır almak için */
export function useBodyColor(): (id: BodyId) => string {
  const c = useColors();
  return (id) => bodyColorOf(id, c);
}

export function useSignColor(): (sign: number) => string {
  const scheme = useScheme();
  return (sign) => signColorOf(sign, scheme);
}

export const BODY_COLORS = BODY_COLOR_SETS;

/** Metin bileşeni olarak gezegen glifi */
export function BodyGlyph({ id, size = 18, style }: { id: BodyId; size?: number; style?: TextStyle }) {
  const bodyColor = useBodyColor();
  const info = BODIES[id];
  const isText = /^[A-Za-z]/.test(info.symbol);
  return (
    <Text
      style={[
        { color: bodyColor(id), fontSize: isText ? size * 0.62 : size, fontWeight: isText ? '800' : '400', lineHeight: size * 1.25 },
        style,
      ]}>
      {info.symbol}
    </Text>
  );
}

export function SignGlyph({ sign, size = 18, style }: { sign: number; size?: number; style?: TextStyle }) {
  const signColor = useSignColor();
  return <Text style={[{ color: signColor(sign), fontSize: size, lineHeight: size * 1.25 }, style]}>{SIGNS[sign].symbol}</Text>;
}

/* ------------------------------------------------------------------ */
/* SVG                                                                 */
/* ------------------------------------------------------------------ */

/** Chiron: anahtar (üstte K, altta daire) */
function ChironPath({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const h = s / 2;
  return (
    <G>
      <Circle cx={x} cy={y + h * 0.55} r={h * 0.42} stroke={color} strokeWidth={s * 0.11} fill="none" />
      <Line x1={x} y1={y + h * 0.13} x2={x} y2={y - h} stroke={color} strokeWidth={s * 0.11} />
      <Line x1={x} y1={y - h * 0.35} x2={x + h * 0.6} y2={y - h} stroke={color} strokeWidth={s * 0.11} />
      <Line x1={x} y1={y - h * 0.35} x2={x + h * 0.6} y2={y + h * 0.2} stroke={color} strokeWidth={s * 0.11} />
    </G>
  );
}

/** Lilith: hilal + haç */
function LilithPath({ x, y, s, color }: { x: number; y: number; s: number; color: string }) {
  const h = s / 2;
  const r = h * 0.5;
  const cy = y - h * 0.3;
  // Dolu hilal: dış yay ile iç yayın farkı
  const d = `M ${x + r} ${cy} A ${r} ${r} 0 1 0 ${x + r * 0.35} ${cy + r * 0.9} A ${r * 0.9} ${r * 0.9} 0 1 1 ${x + r} ${cy} Z`;
  return (
    <G>
      <Path d={d} fill={color} />
      <Line x1={x} y1={cy + r} x2={x} y2={y + h} stroke={color} strokeWidth={s * 0.11} />
      <Line x1={x - h * 0.4} y1={y + h * 0.55} x2={x + h * 0.4} y2={y + h * 0.55} stroke={color} strokeWidth={s * 0.11} />
    </G>
  );
}

/**
 * Çark üzerinde gezegen glifi (SVG). Harf tabanlı noktalar (ASC/MC)
 * küçük, kalın metin olarak çizilir.
 */
export function SvgBodyGlyph({
  id,
  x,
  y,
  size,
  color,
}: {
  id: BodyId;
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  const c = color;
  if (id === 'chiron') return <ChironPath x={x} y={y} s={size} color={c} />;
  if (id === 'lilith') return <LilithPath x={x} y={y} s={size} color={c} />;
  const info = BODIES[id];
  const isText = /^[A-Za-z]/.test(info.symbol);
  return (
    <SvgText
      x={x}
      y={y}
      fill={c}
      fontSize={isText ? size * 0.55 : size}
      fontWeight={isText ? '800' : '400'}
      textAnchor="middle"
      alignmentBaseline="central">
      {info.symbol}
    </SvgText>
  );
}

export function SvgSignGlyph({ sign, x, y, size, color }: { sign: number; x: number; y: number; size: number; color: string }) {
  return (
    <SvgText x={x} y={y} fill={color} fontSize={size} textAnchor="middle" alignmentBaseline="central">
      {SIGNS[sign].symbol}
    </SvgText>
  );
}
