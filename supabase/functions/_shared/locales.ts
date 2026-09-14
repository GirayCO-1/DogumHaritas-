// ÜRETİLMİŞ DOSYA — ELLE DÜZENLEME.
// Kaynak: src/i18n/locales.ts — değiştirmek için orayı düzenle, sonra: npm run sync:shared
/**
 * Desteklenen diller — saf TypeScript, React Native'e bağımlı değil.
 * `src/astro/` de bu modülü kullanabilsin diye ayrı tutulur.
 */

export type Locale = 'tr' | 'en' | 'de' | 'fr' | 'ar';

export interface LocaleInfo {
  code: Locale;
  /** Dilin kendi adı — seçim listesinde böyle görünür */
  name: string;
  /** Intl ve tarih biçimlendirmesi için BCP-47 etiketi */
  tag: string;
  /** Sağdan sola yazılan dil mi */
  rtl: boolean;
  /** Yapay zekâya "bu dilde yaz" derken kullanılan ad */
  promptName: string;
}

export const LOCALES: Record<Locale, LocaleInfo> = {
  tr: { code: 'tr', name: 'Türkçe', tag: 'tr-TR', rtl: false, promptName: 'Türkçe' },
  en: { code: 'en', name: 'English', tag: 'en-US', rtl: false, promptName: 'English' },
  de: { code: 'de', name: 'Deutsch', tag: 'de-DE', rtl: false, promptName: 'Deutsch (German)' },
  fr: { code: 'fr', name: 'Français', tag: 'fr-FR', rtl: false, promptName: 'Français (French)' },
  ar: { code: 'ar', name: 'العربية', tag: 'ar', rtl: true, promptName: 'العربية (Arabic)' },
};

export const LOCALE_ORDER: readonly Locale[] = ['tr', 'en', 'de', 'fr', 'ar'];

export const DEFAULT_LOCALE: Locale = 'en';

/** Cihaz dil etiketinden ("tr-TR", "de") desteklenen bir dile eşle */
export function matchLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (base in LOCALES) return base as Locale;
  }
  return DEFAULT_LOCALE;
}
