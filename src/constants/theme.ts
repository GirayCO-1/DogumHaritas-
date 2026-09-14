/**
 * Uygulama teması.
 *
 * İki palet var: `light` varsayılan (sıcak kâğıt zemin), `dark` gece modu.
 * Renkler doğrudan içe aktarılmaz; bileşenler `useColors()` ile okur ki
 * ayarlardan tema değişince yeniden çizilsinler.
 *
 * Görsel dil: sıcak kâğıt zemin + gölgeyle ayrılan beyaz kartlar (çerçeveyle
 * değil), başlıklarda yumuşak bir serif, gövdede yuvarlak hatlı bir sans.
 */
import { Platform, useColorScheme } from 'react-native';

import type { Element } from '@/astro/types';

export type Scheme = 'light' | 'dark';
/** Kullanıcının ayarlardaki seçimi */
export type Appearance = Scheme | 'system';

export interface Palette {
  scheme: Scheme;
  /** Sayfa zemini */
  background: string;
  /** Zeminden bir kademe yukarısı (modal, sayfa başlığı) */
  backgroundElevated: string;
  /** Kart yüzeyi */
  card: string;
  /** Kart içindeki ikincil blok */
  cardStrong: string;
  /** Çarkın arkasındaki gökyüzü zemini */
  sky: string;
  border: string;
  borderStrong: string;
  /** Ana marka rengi: birincil düğme, etkin durum */
  primary: string;
  primarySoft: string;
  /** Birincil düğmenin üstündeki yazı */
  onPrimary: string;
  /** Astroloji vurgusu: ASC/MC, seçili gezegen, altın detay */
  accent: string;
  accentSoft: string;
  text: string;
  textSecondary: string;
  muted: string;
  success: string;
  danger: string;
  warning: string;
  tabBar: string;
  overlay: string;
  /** Kart gölgesi */
  shadow: string;
  shadowOpacity: number;
}

const light: Palette = {
  scheme: 'light',
  background: '#FAF7F2',
  backgroundElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardStrong: '#F4EFE7',
  sky: '#F6F2FA',
  border: '#EDE6DB',
  borderStrong: '#DED3C3',
  primary: '#5B4BAE',
  primarySoft: 'rgba(91,75,174,0.10)',
  onPrimary: '#FFFFFF',
  accent: '#B4801C',
  accentSoft: 'rgba(180,128,28,0.12)',
  text: '#241F2E',
  textSecondary: '#5E5668',
  muted: '#938B9E',
  success: '#2E8B6B',
  danger: '#C2455A',
  warning: '#B9701A',
  tabBar: '#FFFFFF',
  overlay: 'rgba(36,31,46,0.45)',
  shadow: '#3B2E52',
  shadowOpacity: 0.07,
};

const dark: Palette = {
  scheme: 'dark',
  background: '#0E0C1A',
  backgroundElevated: '#171531',
  card: '#17152E',
  cardStrong: '#201D3F',
  sky: '#131129',
  border: 'rgba(255,255,255,0.09)',
  borderStrong: 'rgba(255,255,255,0.17)',
  primary: '#9B8BFF',
  primarySoft: 'rgba(155,139,255,0.16)',
  onPrimary: '#141033',
  accent: '#E6B85C',
  accentSoft: 'rgba(230,184,92,0.16)',
  text: '#F2EFFA',
  textSecondary: '#B3AECB',
  muted: '#7C7796',
  success: '#5FD3A1',
  danger: '#F0647A',
  warning: '#F5A65B',
  tabBar: '#100E23',
  overlay: 'rgba(5,4,20,0.7)',
  shadow: '#000000',
  shadowOpacity: 0.45,
};

export const Palettes: Record<Scheme, Palette> = { light, dark };

/** Ayar + cihaz tercihinden geçerli şemayı çöz */
export function useScheme(): Scheme {
  const system = useColorScheme();
  const appearance = useAppearance();
  if (appearance === 'system') return system === 'dark' ? 'dark' : 'light';
  return appearance;
}

export function useColors(): Palette {
  return Palettes[useScheme()];
}

/**
 * Ayar deposu bu modüle döngüsel bağımlılık yaratmasın diye enjekte edilir.
 * `src/store/useAppStore.ts` yüklenirken kendini kaydeder.
 */
let appearanceHook: () => Appearance = () => 'light';
export function registerAppearanceHook(hook: () => Appearance): void {
  appearanceHook = hook;
}
function useAppearance(): Appearance {
  return appearanceHook();
}

/* ------------------------------------------------------------------ */
/* Şemadan bağımsız sabitler                                           */
/* ------------------------------------------------------------------ */

/** Element renkleri her iki temada da okunaklı olacak şekilde ayarlı */
export const ElementColors: Record<Scheme, Record<Element, string>> = {
  light: { fire: '#D2553F', earth: '#4F8C42', air: '#B08517', water: '#2E7BC4' },
  dark: { fire: '#F26D5B', earth: '#7CB86A', air: '#F5D06F', water: '#5DA8F2' },
};

export interface AspectPalette {
  harmonious: string;
  tense: string;
  conjunction: string;
  minor: string;
}

export const AspectColors: Record<Scheme, AspectPalette> = {
  light: { harmonious: '#2E7BC4', tense: '#C2455A', conjunction: '#B4801C', minor: '#9B93A8' },
  dark: { harmonious: '#4FA3F7', tense: '#F05A5A', conjunction: '#E6B85C', minor: '#8E8AA8' },
};

export function useElementColors(): Record<Element, string> {
  return ElementColors[useScheme()];
}

export function useAspectColors(): AspectPalette {
  return AspectColors[useScheme()];
}

/**
 * Yazı tipleri.
 * - `display`: Fraunces — yumuşak, sıcak bir serif. Başlıklar ve büyük değerler.
 * - `sans`: Plus Jakarta Sans — yuvarlak hatlı, okunaklı. Gövde ve arayüz.
 * Yüklenmeden önce (ya da yükleme başarısızsa) sistem yazı tipine düşer.
 */
export const FontFamily = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  sans: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemiBold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: { mono: 'ui-monospace' },
  web: { mono: 'ui-monospace, Menlo, monospace' },
  default: { mono: 'monospace' },
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
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

/**
 * Stil tablosunu iki palet için de bir kez kurar. Bileşen `styles[useScheme()]`
 * ile geçerli olanı seçer; böylece her çizimde StyleSheet.create çağrılmaz.
 *
 *     const styles = forEachScheme((c) => StyleSheet.create({ box: { backgroundColor: c.card } }));
 *     ...
 *     const s = styles[useScheme()];
 */
export function forEachScheme<T>(build: (c: Palette) => T): Record<Scheme, T> {
  return { light: build(Palettes.light), dark: build(Palettes.dark) };
}

/** Kartların yüzeyden yükselmesi — çerçeve yerine gölge kullanılır */
export function shadow(c: Palette, level: 1 | 2 = 1) {
  const y = level === 1 ? 2 : 8;
  const blur = level === 1 ? 10 : 24;
  return Platform.select({
    web: { boxShadow: `0 ${y}px ${blur}px rgba(0,0,0,${c.shadowOpacity})` },
    android: { elevation: level === 1 ? 2 : 6 },
    default: {
      shadowColor: c.shadow,
      shadowOpacity: c.shadowOpacity,
      shadowRadius: blur / 2,
      shadowOffset: { width: 0, height: y },
    },
  })!;
}

export const MaxContentWidth = 720;

/**
 * Sekme çubuğunun güvenli alan payı HARİÇ yüksekliği.
 * Gerçek yükseklik = TabBarBaseHeight + insets.bottom (Android'de gezinme
 * çubuğu, iPhone'da ana ekran çizgisi). Hem çubuğun kendisi hem de sekme
 * ekranlarının alt boşluğu bu değeri kullanır.
 */
export const TabBarBaseHeight = 62;
