# Doğum Haritası — geliştirici notları

Expo SDK 57 / React Native 0.86 / expo-router (dosya tabanlı, `src/app`). Sürüme özel API'ler için https://docs.expo.dev/versions/v57.0.0/ esas alınır; `@react-navigation/*` yerine expo-router'ın kendi `Tabs`/`Stack` dışa aktarımları kullanılır.

## Kurallar

- `src/astro/` **React Native'e bağımlı olmamalı**; saf TypeScript kalır ve `npm test` (vitest, Node) ile doğrulanır. Yeni bir hesap eklerken önce test yaz.
- Açısal değerler her yerde derece cinsindendir; boylamlar `norm360` ile 0–360'a indirgenir. Ekliptik boylam tropikal, tarihin gerçek ekliptiğine göredir.
- Çark yerleşimi: Yükselen solda, boylam saat yönünün tersine artar (`ChartWheel.tsx` → `screenAngle`).
- Şehir verisi `src/data/cities.json` elle düzenlenmez; `npm run build:cities` ile üretilir (`scripts/build-cities.mjs`).
- **Uygulama beş dilli:** Türkçe, İngilizce, Almanca, Fransızca, Arapça. Arayüzde sabit metin yazılmaz; `useT()` ile `src/i18n/messages.ts`, astroloji terimleri için `useAstro()` ile `src/astro/i18n.ts` kullanılır. Türkçe katalog tipin kaynağıdır — başka bir dilde anahtar eksikse `tsc` hata verir, `tests/i18n/completeness.test.ts` de yapıyı karşılaştırır.
- Yeni bir metin eklerken beş dilin beşine birden eklenir. Tarih ve yüzde biçimi de dile bağlıdır (`useFormat()`, `t.common.percent`).
- Arapça sağdan soladır. Yön React Native'de açılışta kurulur (`src/app/_layout.tsx`); ayar ekranı kullanıcıyı yeniden başlatma konusunda uyarır. Çark SVG olduğu için aynalanmaz, öyle de kalmalı.
- Başlıklar cümle düzeninde yazılır ("Element dengesi", "Ev sistemi"), Başlık Düzeninde değil.
- Tema `src/constants/theme.ts`: iki palet (`light` varsayılan, `dark` gece modu). Renkler **doğrudan içe aktarılmaz**; bileşen `useColors()` ile okur, modül düzeyindeki stil tabloları `forEachScheme((c) => StyleSheet.create({...}))` ile kurulup `styles[useScheme()]` ile seçilir. Açık temada kartlar çerçeveyle değil gölgeyle (`shadow(c)`) ayrılır.
- Yazı tipleri: başlık `FontFamily.display` (Fraunces), gövde `FontFamily.sans*` (Plus Jakarta Sans). Özel yazı tiplerinde her kalınlık ayrı bir ailedir; `fontWeight` ile birleştirilmez.
- Anasayfa'daki günün özeti ("kozmik nabız", güçlü yanlar, dikkat edilecekler) yapay zekâ ile üretilmez: `src/astro/daily.ts` o günün gerçek transitlerinden türetir, metinler `src/astro/dailyText.ts` içinde beş dilde durur. Uygulama her açıldığında istek atılmaması ve çevrimdışı çalışması için böyle; ücretli olan ayrıntılı yorumdur.
- Claude entegrasyonu yalnızca `src/ai/`; model `claude-opus-5`, resmi `@anthropic-ai/sdk`. API anahtarı asla repoya/koda yazılmaz (`expo-secure-store`).
- Modele gönderilen harita verisi **her zaman İngilizce** serileştirilir (`src/ai/prompts.ts`); yanıtın dili sistem istemindeki `OUTPUT LANGUAGE` direktifiyle belirlenir. Böylece tek bir veri biçimi kalır ve istem önbelleği dil başına çalışır.

## Sık komutlar

```bash
npm test                # vitest
npm run typecheck       # tsc --noEmit
npx expo export --platform web   # statik web derlemesi (çalışıp çalışmadığını görmenin hızlı yolu)
```
