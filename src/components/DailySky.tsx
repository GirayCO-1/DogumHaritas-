/**
 * Günün gökyüzü zemini — "kozmik nabız" kartının arkası.
 *
 * Hazır fotoğraf yerine her gün SVG ile üretilir. Üç sebep: telifli görsel
 * paketlemek gerekmiyor, uygulama boyutu büyümüyor ve en önemlisi zemin o
 * günü belirleyen transit gezegenine göre renkleniyor — rastgele bir manzara
 * değil, günün haritasının karşılığı.
 *
 * Aynı gün her zaman aynı görüntüyü verir: her şey gün numarasından türer.
 */
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import type { BodyId } from '@/astro/types';
import { Radius, useColors, type Scheme } from '@/constants/theme';

interface SkyPalette {
  /** Zemin geçişi (üstten alta) */
  bg: [string, string, string];
  /** Yumuşak ışık lekeleri */
  glow: string;
  /** Serpiştirilmiş noktalar */
  star: string;
}

/**
 * Günü belirleyen gezegene göre zemin. Açık temada yazı koyu olduğu için
 * pastel, koyu temada açık olduğu için derin tonlar kullanılır.
 */
const SKIES: Record<Scheme, Partial<Record<BodyId, SkyPalette>>> = {
  light: {
    sun: { bg: ['#FDF1D7', '#F9E2C4', '#F6ECDC'], glow: '#FFFFFF', star: '#C8891B' },
    moon: { bg: ['#E5EAF8', '#DAE4F2', '#E9E7F4'], glow: '#FFFFFF', star: '#5B6899' },
    mercury: { bg: ['#E0F1F6', '#D6EAF2', '#E7F1ED'], glow: '#FFFFFF', star: '#2E7BC4' },
    venus: { bg: ['#FBE5EB', '#F7DAE3', '#F8E7E1'], glow: '#FFFFFF', star: '#C1537F' },
    mars: { bg: ['#FCE2D8', '#F8D4C8', '#FAE4D6'], glow: '#FFFFFF', star: '#C24A34' },
    jupiter: { bg: ['#E8E3F7', '#DCE9F5', '#E6E1F0'], glow: '#FFFFFF', star: '#BC7522' },
    saturn: { bg: ['#E8E5DE', '#DEDED8', '#EAE5DB'], glow: '#FFFFFF', star: '#7A6540' },
    uranus: { bg: ['#DDF1EF', '#D3ECE9', '#E3F2ED'], glow: '#FFFFFF', star: '#1D8A80' },
    neptune: { bg: ['#E3EEF3', '#DDE9F1', '#E7E5F3'], glow: '#FFFFFF', star: '#4260C4' },
    pluto: { bg: ['#ECE1ED', '#E3D7E9', '#EEE3E7'], glow: '#FFFFFF', star: '#7A4FB5' },
    chiron: { bg: ['#E5F0E2', '#DBEBDB', '#EAF0E3'], glow: '#FFFFFF', star: '#3C8A47' },
    northNode: { bg: ['#E5E5F6', '#DDE3F3', '#EBE4F1'], glow: '#FFFFFF', star: '#655CA6' },
  },
  dark: {
    sun: { bg: ['#2F2413', '#1F1A10', '#2B2116'], glow: '#F5C451', star: '#FFE9B0' },
    moon: { bg: ['#1B2034', '#141A2B', '#1D1E34'], glow: '#8EA2D8', star: '#E8EDFB' },
    mercury: { bg: ['#132B31', '#0F2027', '#17272C'], glow: '#6FC6E8', star: '#D8F2FB' },
    venus: { bg: ['#2F1B26', '#241420', '#2B1B23'], glow: '#E58CB4', star: '#FBDFEA' },
    mars: { bg: ['#2F1B15', '#241310', '#2C1B14'], glow: '#E8775E', star: '#FBD9CE' },
    jupiter: { bg: ['#211D46', '#152238', '#1C1838'], glow: '#9B8BFF', star: '#E6DFFF' },
    saturn: { bg: ['#25231A', '#1A1914', '#242119'], glow: '#C9B48A', star: '#F0E6D2' },
    uranus: { bg: ['#112C2B', '#0D2220', '#162B27'], glow: '#66D8CD', star: '#D6F7F2' },
    neptune: { bg: ['#17232F', '#111C28', '#1B1F31'], glow: '#7C9DF5', star: '#DCE6FD' },
    pluto: { bg: ['#2B1831', '#201226', '#29192C'], glow: '#B58CF5', star: '#EBDCFB' },
    chiron: { bg: ['#192B1D', '#122015', '#1C2B1C'], glow: '#7FC98B', star: '#DBF3DF' },
    northNode: { bg: ['#1F1F3B', '#171D30', '#231F37'], glow: '#9A93E8', star: '#E4E1FA' },
  },
};

/** Gezegen bilinmiyorsa (o gün dar açı yok) nötr bir gece */
const NEUTRAL: Record<Scheme, SkyPalette> = {
  light: { bg: ['#EDEAF4', '#E4E6F0', '#EFEAEA'], glow: '#FFFFFF', star: '#938B9E' },
  dark: { bg: ['#1A1930', '#131226', '#1C1832'], glow: '#8F86C4', star: '#E0DCF2' },
};

/** Aynı gün aynı sahne: tohumlanmış üreteç (mulberry32) */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * viewBox 0–100 × 0–100, `preserveAspectRatio="none"` ile karta yayılır.
 * Daireler böylece elipse dönüşür; istenen zaten yumuşak, düzensiz lekeler.
 */
export function DailySky({
  day,
  body,
  children,
  style,
}: {
  /** Gün numarası — sahne bundan türer */
  day: number;
  /** Günü belirleyen transit gezegeni */
  body: BodyId | null;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const sky = (body ? SKIES[c.scheme][body] : undefined) ?? NEUTRAL[c.scheme];

  const next = rng(day * 2654435761);
  const isLight = c.scheme === 'light';

  const blobs = Array.from({ length: isLight ? 5 : 4 }, (_, i) => ({
    id: `b${i}`,
    cx: 8 + next() * 84,
    cy: 6 + next() * 88,
    rx: 22 + next() * 30,
    ry: 16 + next() * 26,
    opacity: (isLight ? 0.55 : 0.32) * (0.55 + next() * 0.45),
  }));

  /**
   * Noktalar yalnızca koyu temada. Açık zeminde okunaklı olacak kadar koyu
   * bir nokta yıldız gibi değil leke gibi duruyor; günün farkını zaten
   * ışık lekeleri ve renk veriyor.
   *
   * Koyu temada da yazının arkasına düşmesinler diye üst ve alt şeritlere
   * sıkıştırılıyorlar.
   */
  const stars = isLight
    ? []
    : Array.from({ length: 16 }, () => {
        const top = next() < 0.5;
        return {
          cx: next() * 100,
          cy: top ? next() * 16 : 84 + next() * 16,
          r: 0.35 + next() * 0.7,
          opacity: 0.75 * (0.35 + next() * 0.65),
        };
      });

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={sky.bg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
        <Defs>
          {blobs.map((b) => (
            <RadialGradient key={b.id} id={b.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={sky.glow} stopOpacity={b.opacity} />
              <Stop offset="1" stopColor={sky.glow} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((b) => (
          <Ellipse key={b.id} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} fill={`url(#${b.id})`} />
        ))}
        {stars.map((s, i) => (
          <Circle key={`s${i}`} cx={s.cx} cy={s.cy} r={s.r} fill={sky.star} fillOpacity={s.opacity} />
        ))}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: Radius.lg, overflow: 'hidden' },
});
