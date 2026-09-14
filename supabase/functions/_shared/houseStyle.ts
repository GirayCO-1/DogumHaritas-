// ÜRETİLMİŞ DOSYA — ELLE DÜZENLEME.
// Kaynak: src/ai/houseStyle.ts — değiştirmek için orayı düzenle, sonra: npm run sync:shared
/**
 * Ev üslubu (house style) — yorumların "kim tarafından yazılmış" hissini verir.
 *
 * NEDEN BÖYLE: Elde 3–5 profesyonel yorum varken modeli "eğitmek" (fine-tuning)
 * işe yaramaz; bu kadar az örnekte model ya ezberler ya da hiçbir şey öğrenmez.
 * Doğru yöntem, örneklerden damıtılmış üslup kurallarını ve kısa alıntıları
 * doğrudan sistem istemine koymaktır. Model zaten akıcı Türkçe yazabiliyor;
 * ona öğretilmesi gereken tek şey SENİN sesin.
 *
 * NASIL DOLDURULUR:
 *  1. STYLE_RULES: Örnek yorumlardan çıkarılan somut kurallar. "Sıcak yaz" gibi
 *     soyut değil; "bölüme her zaman bir soruyla başla", "burç adını ilk
 *     geçtiğinde parantezle sembolünü ver" gibi uygulanabilir kurallar yaz.
 *  2. STYLE_EXAMPLES: Profesyonel yorumlardan ALINTILAR. Tam metin gerekmez —
 *     her biri 300–800 kelimelik, üslubu en iyi temsil eden bölümler yeterli.
 *     Uzun metinler her istekte token maliyeti demektir.
 *
 * İkisi de boşken uygulama eskisi gibi çalışır (varsayılan üslup).
 */

/** Örneklerden damıtılan somut yazım kuralları. Boşsa varsayılan üslup kullanılır. */
export const STYLE_RULES = '';

export interface StyleExample {
  /** Kısa etiket: "Natal — Genel Bakış ve Güneş bölümü" gibi */
  label: string;
  /** Profesyonel yorumdan alıntı (300–800 kelime önerilir) */
  text: string;
}

/**
 * Üslup örnekleri. Model bunları KOPYALAMAZ, yalnızca ses/ritim/yapı
 * referansı olarak kullanır — bu kural aşağıda açıkça belirtilir.
 */
export const STYLE_EXAMPLES: StyleExample[] = [];

/** Kelime sayısı (kaba) — uzun örnekleri fark etmek için */
function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

/**
 * Sistem istemine eklenecek üslup bölümü.
 * Hiçbir şey tanımlı değilse boş dize döner (istem değişmez, önbellek bozulmaz).
 */
export function buildStyleSection(
  styleRules: string = STYLE_RULES,
  styleExamples: readonly StyleExample[] = STYLE_EXAMPLES,
): string {
  const rules = styleRules.trim();
  const examples = styleExamples.filter((e) => e.text.trim());
  if (!rules && !examples.length) return '';

  const parts: string[] = ['\n\n# Ev üslubu\n'];
  parts.push(
    'Aşağıdaki kurallar ve örnekler, yorumların yazılması gereken sesi tanımlar. Yukarıdaki ilkelerle çelişirlerse yukarıdaki ilkeler geçerlidir (doğruluk ve kaderci olmama her zaman önce gelir).',
  );

  if (rules) {
    parts.push('\n## Üslup kuralları\n' + rules);
  }

  if (examples.length) {
    parts.push(
      '\n## Üslup örnekleri\n' +
        'Bunlar aynı işi yapan bir yazarın önceki yorumlarından alıntılardır. Sesini, cümle ritmini, bölüm kurgusunu ve terim kullanımını buradan al. ' +
        'ÖNEMLİ: Bu metinlerdeki astrolojik yerleşimler BAŞKA haritalara aittir — içeriği, örnekleri ya da cümleleri kopyalama. Yalnızca üslubu taşı; yorumun tamamen sana verilen haritadan çıkmalı.',
    );
    for (const ex of examples) {
      parts.push(`\n<ornek etiket="${ex.label}">\n${ex.text.trim()}\n</ornek>`);
    }
  }

  return parts.join('\n');
}

/** Ayarlar ekranında göstermek / hata ayıklamak için özet */
export function styleSummary(): { configured: boolean; ruleWords: number; examples: number; exampleWords: number } {
  const examples = STYLE_EXAMPLES.filter((e) => e.text.trim());
  return {
    configured: !!STYLE_RULES.trim() || examples.length > 0,
    ruleWords: wordCount(STYLE_RULES),
    examples: examples.length,
    exampleWords: examples.reduce((n, e) => n + wordCount(e.text), 0),
  };
}
