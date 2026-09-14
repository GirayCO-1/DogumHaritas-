# Doğum Haritası

Astromatik benzeri, Türkçe bir **doğum haritası (natal chart) uygulaması**. Expo / React Native ile yazıldı; Android, iOS ve web'de çalışır. Tüm astronomik hesaplar cihazda yapılır, internet gerektirmez. İsteğe bağlı olarak Claude ile kişiye özel yorum üretir.

## Özellikler

- **Doğum haritası çarkı** — SVG; burç kuşağı, 12 ev, gezegen glifleri, açı çizgileri, dokununca gezegen detayı
- **Gezegenler** — Güneş, Ay, Merkür … Plüton, Chiron, Kuzey/Güney Ay Düğümü (gerçek veya ortalama), Lilith (Kara Ay), Şans Noktası, Vertex
- **Ev sistemleri** — Placidus (varsayılan), Koch, Tam Burç, Eşit, Porphyry, Campanus, Regiomontanus
- **Açılar** — kavuşum, karşıt, üçgen, kare, altmışlık, yüzellilik (+ isteğe bağlı küçük açılar); orb, yaklaşan/uzaklaşan; açı matrisi
- **Element / nitelik dengesi, onurlar** (yöneticilik, yücelme, zarar, düşük)
- **Günlük transitler** — bugünün gökyüzünün natal haritayla açıları, Ay evresi, retro gezegenler, gün gün ileri/geri
- **Sinastri** — iki harita karşılaştırması, uyum skoru (5 kategori), karşılıklı açılar, evlere düşüşler
- **Profiller** — sınırsız kişi, cihazda saklanır
- **Yapay zekâ yorumu** — natal / günlük / ilişki yorumu (Claude, `claude-opus-5`); kendi API anahtarınla ya da sunucu vekiliyle
- **Şehir veritabanı** — 27.000+ yerleşim (Türkiye'nin tüm il ve ilçeleri dahil), her biri için IANA saat dilimi; tarihsel yaz saati kuralları otomatik uygulanır

## Kurulum ve Expo Go ile test

Gereksinimler: Node 20+ (22 önerilir), telefonda [Expo Go](https://expo.dev/go) (SDK 57).

```bash
git clone https://github.com/GirayCO-1/DogumHaritas-.git
cd DogumHaritas-
git checkout claude/birth-chart-viewer-app-vn294e
npm install
npx expo start
```

Terminalde çıkan QR kodu **Android'de Expo Go uygulamasından**, **iPhone'da Kamera'dan** okut. Bilgisayar ve telefon aynı Wi-Fi'da olmalı.

| Sorun | Çözüm |
|---|---|
| Telefon bağlanamıyor (farklı ağ, kurumsal Wi-Fi, VPN) | `npx expo start --tunnel` (ilk seferde `@expo/ngrok` kurulumunu onayla) |
| "Project is incompatible with this version of Expo Go" | Telefondaki Expo Go'yu güncelle; proje SDK 57 |
| Metro çok yavaş / cache sorunu | `npx expo start --clear` |
| Web'de hızlı bakmak istiyorsan | `npx expo start --web` ya da terminalde `w` |

Tüm özellikler Expo Go'da çalışır (SVG çark, şehir arama, transitler, sinastri, Claude yorumu). `expo-secure-store` Expo Go'da da desteklenir; mağaza sürümü için yine de bir **development build** (`npx expo run:android`) ya da EAS derlemesi önerilir.

### Yeni sürümü çekmek

Expo Go eski sürümü gösteriyorsa neredeyse her zaman sebebi **yeni bağımlılıkların kurulmamış olmasıdır**. Sunucuyu `Ctrl+C` ile durdur, sonra sırayla (PowerShell'de `&&` çalışmaz, her satırı ayrı çalıştır):

```powershell
git fetch origin
git checkout claude/birth-chart-viewer-app-vn294e
git pull origin claude/birth-chart-viewer-app-vn294e
npm install
npx expo start --tunnel --clear
```

`npm install` atlanırsa Metro `Unable to resolve module ...` hatası verir ya da eski paket dosyası kullanılmaya devam eder.

Telefonda: Expo Go'yu **tamamen kapat** (arka plandan kaydırarak at), yeniden aç ve yeni QR kodu okut. Sadece "Reload" demek bağımlılık değiştiğinde yetmez.

Doğru sürümde olduğunu şuradan anlarsın: alt sekme çubuğunda **Anasayfa** ilk sırada görünür ve uygulama açık (beyaz) temayla açılır.

### Komutlar

| Komut | Açıklama |
|---|---|
| `npm test` | Astronomi çekirdeği ve şehir arama testleri (vitest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (expo yapılandırması) |
| `npm run build:cities` | Şehir veritabanını yeniden üretir (`src/data/cities.json`) |
| `npx expo export --platform web` | Statik web derlemesi |

### Android APK / Play Store

```bash
npm install -g eas-cli
eas build -p android --profile preview   # test APK
eas build -p android --profile production
```

## Mimari

```
src/
├── astro/          Saf TypeScript hesap motoru (RN'den bağımsız, Node'da test edilir)
│   ├── ephemeris.ts   astronomy-engine sarmalayıcı, düğümler, Lilith, Chiron
│   ├── houses.ts      7 ev sistemi, ASC/MC/Vertex
│   ├── aspects.ts     açı hesabı, orb, yaklaşan/uzaklaşan
│   ├── chart.ts       computeNatalChart()
│   ├── transits.ts    computeTransits()
│   ├── synastry.ts    computeSynastry()
│   └── time.ts        yerel saat → UTC (luxon, IANA tz)
├── app/            expo-router ekranları (sekmeler: Harita, Bugün, Uyum, Profiller)
├── components/     ChartWheel (SVG), tablolar, form, şehir seçici
├── ai/             Claude istemcisi, istemler, güvenli anahtar saklama
├── store/          zustand + AsyncStorage (profiller, ayarlar, yorum önbelleği)
└── data/           cities.json + arama
server/             Cloudflare Worker vekili (API anahtarını sunucuda tutar)
supabase/           Aynı vekilin Supabase Edge Function sürümü (biri yeterli)
tests/              vitest
scripts/            veri üretim betikleri
```

### Hesap doğruluğu

- Gezegen boylamları **astronomy-engine** (VSOP87 + nütasyon + aberasyon, ~1′) ile; tarihin gerçek ekliptiği, tropikal zodyak.
- Chiron için Moshier tabanlı `ephemeris` paketi; testlerde iki motor birbirine karşı doğrulanır (0,02° içinde).
- Gerçek Ay Düğümü, Ay'ın anlık yörünge düzleminden (konum × hız) hesaplanır; ortalama düğüm ve Lilith Meeus formülleriyle.
- Ev başlangıçları RAMC / eğiklik / enlem üzerinden kapalı formüllerle; Placidus iteratif. Kutup enlemlerinde (|φ| > 66°) Porphyry'ye düşülür.
- Test seti: Einstein'ın yayınlanmış haritası, ekvator/kutup sınır durumları, Vertex'in ana dikey daire üzerinde olduğu, Türkiye'nin 1990 yaz saati ve 2016 sonrası kalıcı UTC+3 kuralı.

## Yapay zekâ yorumu

Ayarlar → Yapay Zekâ Yorumu:

1. **Kendi API anahtarım** — anahtar cihazda Keychain/Keystore'da saklanır, doğrudan `api.anthropic.com`'a gider. Geliştirme ve kişisel kullanım için.
2. **Sunucu vekili** — dağıtım için tek doğru yol. Anahtar yalnızca sunucuda durur.

### Tüm kullanıcılara tek anahtarla yorum (dağıtım)

Kullanıcıların hiçbir ayar yapmadan yorum alması ve faturanın sana gelmesi için bir vekil sunucu yayımla. **İki seçenek var, birini seç** — ikisi aynı işi yapar:

| Seçenek | Ne zaman | Kurulum |
|---|---|---|
| **Supabase Edge Function** | Zaten Supabase kullanıyorsan (ek servis yok) | [`supabase/README.md`](supabase/README.md) |
| **Cloudflare Worker** | Supabase yoksa | [`server/README.md`](server/README.md) |

Her iki durumda da adresi proje kökündeki `.env` dosyasına yaz:

```
cp .env.example .env
```

```
# Supabase kullandıysan
EXPO_PUBLIC_AI_PROXY_URL=https://<PROJE_REF>.supabase.co/functions/v1/interpret
# Cloudflare kullandıysan
EXPO_PUBLIC_AI_PROXY_URL=https://<ad>.workers.dev/interpret
```

`.env` dolduğunda uygulama kutudan çıktığı gibi vekili kullanır; Ayarlar'da "Uygulama sunucusu kullanılıyor" yazar ve anahtar kutusu hiç görünmez.

> **API anahtarını asla uygulamaya gömme.** APK herkese açık bir arşivdir; içindeki
> metinler tek komutla çıkarılır ve gömülü anahtarları tarayan botlar vardır.
> `EXPO_PUBLIC_*` değişkenleri de JS paketine gömülür — oraya yalnızca vekil
> adresi yazılır, anahtar değil. Kötüye kullanıma karşı asıl koruma Cloudflare
> hız sınırı ve Anthropic Console'daki harcama limitidir.

Modele yalnızca harita verisi (konumlar, evler, açılar) ve profil adı gönderilir. Yorumlar önbelleğe alınır; profil ya da ev sistemi değişince yenilenir.

## Lisans ve veri kaynakları

Uygulamaya gömülen çalışma zamanı bağımlılıkları MIT/Apache lisanslıdır. GPL lisanslı iki paket **yalnızca derleme zamanında** (devDependencies) veri üretmek için kullanılır; uygulama paketine kodları girmez, yalnızca üretilen sayısal tablolar girer:

| Kaynak | Kullanım | Lisans |
|---|---|---|
| `astronomy-engine` | Gezegen konumları (çalışma zamanı) | MIT |
| `luxon` | Saat dilimi dönüşümü (çalışma zamanı) | MIT |
| `all-the-cities` (GeoNames türevi) | Şehir listesi → `cities.json` | MIT / CC BY 4.0 |
| `country-state-city` | Türkiye ilçeleri → `cities.json` | GPL-3.0 (yalnızca derleme) |
| `@photostructure/tz-lookup` | Koordinat → saat dilimi → `cities.json` | MIT |
| `ephemeris` (Moshier) | Chiron tablosu → `chiron.json` (1900–2100, 16 gün adım, kübik interpolasyon; hata < 0,002°) | GPL-3.0 (yalnızca derleme) |

GeoNames verisi CC BY 4.0 gerektirir: mağaza açıklamasında ve uygulama içi "Hakkında" bölümünde atıf bulunur.
