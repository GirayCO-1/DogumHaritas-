/**
 * Yorum temaları — kullanıcı haritasına hangi gözle bakılacağını seçer.
 *
 * Tema hem modele verilen odak talimatını hem de uygulamadaki etiketleri
 * belirler. Saf metin: uygulama, Cloudflare Worker ve Supabase fonksiyonu
 * aynı tanımı paylaşır.
 */

export type InterpretationTheme = 'general' | 'career' | 'love' | 'money' | 'health' | 'growth';

export interface ThemeInfo {
  key: InterpretationTheme;
  /** Ionicons adı */
  icon: string;
  /**
   * Modele verilen odak talimatı. Arayüzde görünen ad ve alt başlık burada
   * değil, `src/i18n/messages.ts` içindedir — bunlar kullanıcıya gösterilir
   * ve dile göre değişir; odak talimatı modele gider ve tek dilde kalır.
   */
  focus: string;
}

export const THEMES: Record<InterpretationTheme, ThemeInfo> = {
  general: {
    key: 'general',
    icon: 'sparkles-outline',
    focus: 'Haritanın bütününe dengeli bak; tek bir yaşam alanına odaklanma.',
  },
  career: {
    key: 'career',
    icon: 'briefcase-outline',
    focus:
      'Odağın kariyer, iş yaşamı ve toplumsal konum. Öncelikle 10. ev ve MC, ardından 6. ev (günlük iş, hizmet) ve 2. ev (kazanç); gezegen olarak MC yöneticisi, Satürn, Jüpiter, Güneş ve Mars. Başka alanlara yalnızca kariyeri doğrudan etkilediği ölçüde değin.',
  },
  love: {
    key: 'love',
    icon: 'heart-outline',
    focus:
      'Odağın aşk, ilişkiler ve evlilik. Öncelikle 7. ev ve Alçalan, ardından 5. ev (flört, yaratıcılık) ve 8. ev (yakınlık, paylaşım); gezegen olarak Venüs, Mars, Ay ve 7. ev yöneticisi. Başka alanlara yalnızca ilişkileri doğrudan etkilediği ölçüde değin.',
  },
  money: {
    key: 'money',
    icon: 'wallet-outline',
    focus:
      'Odağın maddi konular. Öncelikle 2. ev (kendi kazancın), ardından 8. ev (ortak kaynaklar, borç, miras) ve 11. ev (gelirin meyveleri); gezegen olarak Venüs, Jüpiter, Satürn ve 2. ev yöneticisi. Yatırım tavsiyesi verme; eğilimlerden söz et.',
  },
  health: {
    key: 'health',
    icon: 'fitness-outline',
    focus:
      'Odağın yaşam enerjisi, günlük düzen ve dayanıklılık. Öncelikle 6. ev (rutin, beden), ardından 1. ev (yapı, canlılık) ve 12. ev (dinlenme, geri çekilme); gezegen olarak Güneş, Ay, Mars ve Satürn. TEŞHİS KOYMA, hastalık adı verme, tedavi önerme; yalnızca yaşam düzeni ve farkındalık üzerinden konuş ve gerektiğinde hekime yönlendir.',
  },
  growth: {
    key: 'growth',
    icon: 'leaf-outline',
    focus:
      'Odağın içsel gelişim ve anlam arayışı. Öncelikle Ay düğümleri (yaşam yönü) ve Chiron (yara ve iyileşme), ardından 9. ev (inanç, öğrenme), 12. ev (bilinçaltı) ve 4. ev (kökler); gezegen olarak Jüpiter, Satürn, Neptün ve Plüton.',
  },
};

export const THEME_ORDER: readonly InterpretationTheme[] = [
  'general',
  'career',
  'love',
  'money',
  'health',
  'growth',
];

export function themeFocus(theme: InterpretationTheme): string {
  return (THEMES[theme] ?? THEMES.general).focus;
}
