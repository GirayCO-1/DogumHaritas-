/**
 * Dil katmanı.
 *
 * Bileşenler `useT()` ile arayüz metinlerini, `useAstro()` ile astroloji
 * terimlerini okur. Dil ayardan gelir; ayar "system" ise cihazın dili
 * kullanılır ve desteklenmeyen bir dil İngilizce'ye düşer.
 */
import { getLocales } from 'expo-localization';
import { useMemo } from 'react';
import { I18nManager } from 'react-native';

import { astroText, type AstroText } from '@/astro/i18n';

import { LOCALES, matchLocale, type Locale } from './locales';
import { MESSAGES, type Messages } from './messages';

export { LOCALES, LOCALE_ORDER, DEFAULT_LOCALE, type Locale, type LocaleInfo } from './locales';
export type { Messages } from './messages';

/** Ayarda "cihazın dili" seçeneği */
export type LanguageSetting = Locale | 'system';

/**
 * Ayar deposu bu modüle döngüsel bağımlılık yaratmasın diye enjekte edilir.
 * `src/store/useAppStore.ts` yüklenirken kendini kaydeder.
 */
let languageHook: () => LanguageSetting = () => 'system';
export function registerLanguageHook(hook: () => LanguageSetting): void {
  languageHook = hook;
}

/** Cihazın tercih ettiği diller — modül başına bir kez okunur */
const deviceLocale: Locale = matchLocale(getLocales().map((l) => l.languageTag));

export function useLocale(): Locale {
  const setting = languageHook();
  return setting === 'system' ? deviceLocale : setting;
}

export function useT(): Messages {
  return MESSAGES[useLocale()];
}

export function useAstro(): AstroText {
  return astroText(useLocale());
}

/** Geçerli dil sağdan sola mı yazılıyor */
export function useRtl(): boolean {
  return LOCALES[useLocale()].rtl;
}

/**
 * Tarih ve sayı biçimlendirme. Intl etiketi dile göre değişir; Hicri
 * takvim değil, Arapça'da da Miladi takvim Arapça adlarla gösterilir.
 */
export function useFormat() {
  const locale = useLocale();
  const tag = LOCALES[locale].tag;
  return useMemo(
    () => ({
      tag,
      date: (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString(tag, opts),
      /** "14 Eylül Pazartesi" / "Monday, 14 September" */
      dayLong: (d: Date) => d.toLocaleDateString(tag, { day: 'numeric', month: 'long', weekday: 'long' }),
    }),
    [tag],
  );
}

/**
 * Arapça seçilince yerleşimin sağdan sola dönmesi için React Native'in
 * yönü uygulama açılışında belirlenir; sonradan değiştirmek yeniden
 * başlatma ister. Bu yüzden ayar ekranı kullanıcıyı uyarır.
 */
export function isRtlActive(): boolean {
  return I18nManager.isRTL;
}
