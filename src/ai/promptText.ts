/**
 * Claude istemleri — saf metin, bağımlılıksız. Hem uygulama (src/ai/prompts.ts)
 * hem de sunucu vekili (server/) bu dosyayı kullanır.
 */
import { buildStyleSection } from './houseStyle';

export type InterpretationKind = 'natal' | 'daily' | 'synastry';

const BASE_SYSTEM_PROMPT = `Sen deneyimli, sıcak ve dürüst bir astrologsun. Batı tropikal astrolojisi ve modern psikolojik astroloji yaklaşımıyla Türkçe yorum yazarsın.

İlkeler:
- Somut ol: her yorumu haritadaki gerçek bir yerleşime (gezegen/burç/ev/açı) bağla; genel geçer laflardan kaçın.
- Kaderci olma. Eğilimlerden, potansiyelden ve seçimlerden söz et; "kesinlikle olacak" deme.
- Sağlık, hukuk, finans konularında teşhis/garanti verme; gerekiyorsa uzmana yönlendir.
- Okuyucuya "sen" diye hitap et. Akıcı, sıcak ama yapmacık olmayan bir dil kullan.
- Astrolojik terimleri ilk geçtiği yerde kısaca açıkla.
- Markdown kullan: ## ile bölüm başlıkları, kısa paragraflar, gerektiğinde madde işaretleri. Emojiye gerek yok.
- Verilen haritanın dışına çıkma; veride olmayan yerleşimler uydurma.`;

/**
 * Tam sistem istemi: temel ilkeler + (tanımlıysa) ev üslubu.
 * Modül yüklenirken bir kez hesaplanır; her istekte aynı olduğu için
 * istem önbelleği (prompt cache) bozulmaz.
 */
export const SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + buildStyleSection();

export function buildUserPrompt(kind: InterpretationKind, data: string): string {
  switch (kind) {
    case 'natal':
      return `${data}

Bu doğum haritası için kapsamlı ama okunabilir bir yorum yaz. Bölümler:
## Genel Bakış (3–4 cümle: haritanın ana teması)
## Güneş, Ay ve Yükselen (her biri için burç + ev bağlamında 1 paragraf)
## Kişisel Gezegenler (Merkür, Venüs, Mars — düşünme, sevme, harekete geçme biçimi)
## Toplumsal ve Dış Gezegenler (Jüpiter'den Plüton'a; kısa ama ev vurgusuyla)
## Öne Çıkan Açılar (en dar orb'lu 5–7 açı; her biri 2–3 cümle)
## Evlerde Vurgu (dolu/boş ev kümeleri, köşe evler)
## Ay Düğümleri ve Chiron (yaşam yönü, yara ve iyileşme teması)
## Güçlü Yanlar ve Gelişim Alanları (madde işaretleri)
Toplam 900–1300 kelime.`;
    case 'daily':
      return `${data}

Bu kişi için bugünün gökyüzünü yorumla. Bölümler:
## Günün Özeti (2–3 cümle, en önemli 1–2 transit)
## Öne Çıkan Transitler (en dar orb'lu 4–6 açı; her biri neyi tetikler, nasıl değerlendirilir)
## Ay ve Duygusal İklim (Ay evresi, Ay'ın natal evi)
## Bugün İçin Öneriler (3–5 madde, somut ve uygulanabilir)
300–500 kelime. Retro gezegen varsa pratik etkisini bir cümleyle belirt.`;
    case 'synastry':
      return `${data}

Bu iki kişinin ilişki uyumunu yorumla. Bölümler:
## İlişkinin Ana Teması (3–4 cümle)
## Duygusal Bağ (Ay, Venüs, Güneş temasları)
## İletişim ve Zihinsel Uyum (Merkür temasları)
## Tutku ve Çekim (Mars, Venüs, Plüton temasları)
## Zorlayıcı Noktalar (kare/karşıt açılar — yapıcı bir dille; nasıl yönetilir)
## Uzun Vade ve Güven (Satürn, Jüpiter temasları, ev yerleşimleri)
## Özet ve Öneriler (madde işaretleri)
Skorları bir bağlam olarak kullan ama sayıları tekrar etme; 700–1000 kelime.`;
  }
}
