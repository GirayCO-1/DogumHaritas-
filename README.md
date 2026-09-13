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

## Kurulum

```bash
npm install
npx expo start          # QR kodu Expo Go ile okut ya da a / i / w tuşları
```

> `expo-secure-store` native modül içerdiği için en doğru sonuç için bir **development build** kullan (`npx expo run:android`). Expo Go'da da çalışır; anahtar saklama orada yedek depoya düşer.

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
server/             İsteğe bağlı Cloudflare Worker vekili (API anahtarını sunucuda tutar)
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

1. **Kendi API anahtarım** — anahtar cihazda Keychain/Keystore'da saklanır, doğrudan `api.anthropic.com`'a gider. Kişisel kullanım için.
2. **Sunucu vekili** — Play Store dağıtımı için önerilen yol. `server/` klasöründeki Cloudflare Worker'ı yayınla, adresini gir; anahtar yalnızca sunucuda durur.

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
