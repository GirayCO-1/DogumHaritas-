/**
 * Uygulama teması — koyu, kozmik bir palet (Astromatik benzeri).
 * Tek bir koyu tema kullanılır; renkler tüm bileşenlerde buradan okunur.
 */
import { Platform } from 'react-native';

import type { Element } from '@/astro/types';

export const Colors = {
  background: '#0B0A1F',
  backgroundElevated: '#141335',
  card: 'rgba(255,255,255,0.055)',
  cardStrong: 'rgba(255,255,255,0.09)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  primary: '#E6B85C',
  primarySoft: 'rgba(230,184,92,0.16)',
  accent: '#8B7CF6',
  accentSoft: 'rgba(139,124,246,0.18)',
  text: '#F3F1FF',
  textSecondary: '#B4B1D3',
  muted: '#7B789C',
  success: '#5FD3A1',
  danger: '#F0647A',
  warning: '#F5A65B',
  tabBar: '#100F2A',
  overlay: 'rgba(5,4,20,0.7)',
} as const;

export const ElementColors: Record<Element, string> = {
  fire: '#F26D5B',
  earth: '#7CB86A',
  air: '#F5D06F',
  water: '#5DA8F2',
};

export const AspectColors = {
  harmonious: '#4FA3F7',
  tense: '#F05A5A',
  conjunction: '#E6B85C',
  minor: '#8E8AA8',
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', mono: 'ui-monospace' },
  web: { sans: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', serif: 'Georgia, serif', mono: 'ui-monospace, Menlo, monospace' },
  default: { sans: 'normal', serif: 'serif', mono: 'monospace' },
})!;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const MaxContentWidth = 720;
