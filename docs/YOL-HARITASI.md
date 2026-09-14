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
Seçilen yön: **beyaz/sıcak kâğıt zemin varsayılan**, gece modu ayarlarda.
His olarak Astromatik + Headspace + Meditasyon karışımı.

### Yapıldı
- İki paletli tema sistemi (`light` varsayılan, `dark`), ayarlarda Açık / Gece / Cihaz seçimi
- Yazı tipleri: Fraunces (başlık, serif) + Plus Jakarta Sans (gövde)
- Çerçeveli kart yığını yerine gölgeyle ayrılan beyaz kartlar
- Büyük harf mikro etiketler yerine serif bölüm başlıkları, cümle düzeninde
- Harita ekranı yeniden kuruldu: karşılama başlığı, çark kendi gökyüzü zemininde,
  üç temel kutucukları, "Bugün neyi merak ediyorsun?" yorum daveti
- Çark açık zeminde okunaklı: gezegen renkleri palete göre, ASC/DSC etiketleri kırpılmıyor

- **Anasayfa sekmesi** (ilk sırada): "Bugün" ve "Haritam" bölümleri
  - Bugün: kozmik nabız (günün cümlesi), enerji seviyesi, güçlü yanlar,
    dikkat edilecekler — hepsi `src/astro/daily.ts` ile gerçek transitlerden,
    yapay zekâ çağrısı olmadan
  - Nabız cümlesi gezegen × açı başına 3 seçenekten gün numarasına göre
    dönüyor (108 cümle); zemin de `DailySky` ile her gün yeniden üretiliyor
    ve günü belirleyen gezegene göre renkleniyor
  - Haritam: doğum bilgisi, çark, üç temel, element dengesi, haritanın
    detayları ve tema seçimli natal yorum
  - Sekme çubuğu dört sekme: Anasayfa · Gökyüzü · Uyum · Profiller. Ayrı
    Harita sekmesi Anasayfa → Haritam ile aynı içeriği gösterdiği için
    kaldırıldı.

### Kalan
- Gökyüzü, Uyum, Profiller, Yorum ekranları yeni dile taşındı ama ekran ekran
  gözden geçirilmedi
- Mükerrer giriş noktaları sadeleştirildi: Ayarlar yalnızca Kişiler'de, yeni
  kişi yalnızca Kişiler'de, kişi düzenleme yalnızca Kişiler'de, ev sistemi
  çipi artık kısayol değil. Ay evresinin iki yerde kalmasına karar verildi
  (Anasayfa'da tek satır özet, Gökyüzü'nde ayrıntılı kart).
- **Dil seçeneği** isteniyor: uygulama şu an Türkçe'ye gömülü. Kapsam ve
  hedef dil(ler) netleşmeyi bekliyor — aşağıya bak.
- Boş durumlar, yükleniyor durumları, geçiş animasyonları
- Uygulama simgesi ve açılış ekranı hâlâ koyu temaya göre

---

## 2b. Dil desteği — **KARAR BEKLİYOR**

Uygulamada dil seçeneği yok; her şey Türkçe yazılı. Gerçek bir dil seçimi üç
ayrı katmanı ilgilendiriyor ve maliyetleri çok farklı:

| Katman | İçerik | İş |
| --- | --- | --- |
| Yapay zekâ yorumunun dili | `src/ai/promptText.ts` sistem istemi | **Küçük.** İsteme tek satır dil talimatı; model zaten çok dilli. |
| Arayüz metinleri | ~250 dizge, 16 dosyaya gömülü | **Orta.** Önce bir i18n katmanı (dizge kataloğu + `t()` kancası), sonra çeviri. |
| Astroloji içeriği | `daily.ts` 108 cümle + ev/burç/gezegen adları, `themes.ts`, `houseStyle.ts` | **Büyük.** Üslup ve terminoloji çevirisi; makine çevirisi kalitesi düşürür. |

Karar gereken: hangi dil(ler), ve yorum dili arayüz dilini mi izlesin yoksa
ayrı mı seçilsin. En ucuz ilk adım yorum dili; arayüz ve içerik sonra
aşamalı gelebilir.

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
