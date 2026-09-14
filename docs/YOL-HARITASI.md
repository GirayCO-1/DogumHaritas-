# Yol Haritası

Kararlaştırılan sıra: **1) eksik özellikler → 2) arayüz → 3) ödeme katmanı.**

---

## 1. Özellikler

### Tamamlandı
- Doğum haritası: çark, gezegen/ev/açı tabloları, 7 ev sistemi, gerçek & ortalama düğüm, Chiron, Şans Noktası
- Kayıtlı profiller, profil arası geçiş
- Günlük gökyüzü (transitler) + sinastri
- **Herhangi bir tarihe atlama** — `DateJumpModal`, 1900–2099
- **Tema odaklı yorum** — Genel / Kariyer / Aşk / Para / Sağlık / Gelişim (`src/ai/themes.ts`)
- **`forecast` yorum türü** — uzak tarihlerde ağırlık yavaş gezegenlerde
- **Element şeridi** — ana ekranda element dengesi ve "en zayıf" etiketi
- **Ev üslubu** — profesyonel yorum kayıtlarından çıkarılmış 12 üslup kuralı (`src/ai/houseStyle.ts`)

### Sırada (astrolojik derinlik)
Profesyonel yorumcunun kullandığı, bizde henüz olmayan teknikler:

| Teknik | Ne işe yarar | Zorluk |
| --- | --- | --- |
| Yıllık profeksiyon | Yaşa göre "bu yılın evi" ve yıl yöneticisi | Kolay — yaş ÷ 12 |
| Solar return | Güneş'in doğum derecesine döndüğü an için harita | Orta — kök bulma |
| İkincil progresyon | 1 gün = 1 yıl; içsel gelişim zamanlaması | Orta |

Üçü de `src/astro/` içinde saf TypeScript olarak yazılabilir; önce test.

---

## 2. Arayüz

Kullanıcı notu: **"şu an fazla AI kokuyor."**

Ele alınacaklar (yön kullanıcıyla netleştirilecek):
- Jenerik kart + chip yığını yerine kendine ait bir görsel dil
- Tipografi hiyerarşisi: şu an her şey benzer ağırlıkta
- Çark ekranın kahramanı olmalı, tabloların arasında kaybolmamalı
- Boş durumlar, yükleniyor durumları, geçişler
- Renk paleti: tek koyu tema (`src/constants/theme.ts`) korunacak, ama daha az "varsayılan mor"

---

## 3. Ödeme katmanı — **KARAR BEKLİYOR**

> **Hatırlatma (kullanıcı isteği):** Üyelik ve ek ücretler belirlenirken bu
> başlık kullanıcıya hatırlatılacak. Bu iş eksik bırakıldı.

### Karara bağlanmamış
1. **Ücretlendirme modeli** — hangisi?
   - **Kredi yükleme**: kullanıcı bakiye alır, her detaylı yorum bakiyeden düşer
   - **Yorum başına satın alma**: her yorum ayrı ürün
   - **Abonelik**: aylık N yorum
   - (karma model de mümkün: abonelik + ek kredi)
2. **Fiyatlar** — yorum başına maliyet ~0,15 USD (Claude). Marj ve TL fiyatı belirlenmedi.
3. **Neyin ücretli olacağı** — harita hesaplama hep ücretsiz kalır. Ücretli olması konuşulanlar: tema odaklı detaylı yorumlar, ileri tarihli öngörüler, sinastri.

### Teknik plan (karardan bağımsız, hazır)
- Supabase anonim kimlik → cihaz başına hesap
- Edge Function'da kota/sayaç: yorum üretmeden önce bakiye kontrolü
- Mağaza tahsilatı için RevenueCat **ya da** kendi katmanımız
- Hepsi yeniden kullanılabilir bir `@giray/entitlements` paketinde toplanacak —
  sonraki uygulamalara "soket gibi" takılabilsin

---

## Değişmez kurallar

- **API anahtarı asla repoda, kodda ya da pakette olmaz.** Yalnızca sunucu gizlilerinde
  (Supabase secrets / Cloudflare secrets) durur. `EXPO_PUBLIC_*` değişkenleri JS
  paketine gömülür — oraya sadece vekil adresi yazılır.
- `src/astro/` React Native'e bağımlı olmaz; saf TypeScript kalır.
- GPL bağımlılıklar (`ephemeris`, `country-state-city`) yalnızca `devDependencies`;
  çıktıları JSON olarak üretilir, kodları pakete girmez.
