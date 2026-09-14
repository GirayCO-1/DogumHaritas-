# Supabase Edge Function — yorum vekili

Anthropic API anahtarını kullanıcıların telefonuna koymadan, tüm kullanıcılara tek anahtarla yorum üretmenin yolu. `server/` klasöründeki Cloudflare Worker ile **aynı işi** yapar ve aynı sözleşmeyi konuşur — **ikisine birden ihtiyacın yok**, birini seç.

| | Supabase Edge Functions | Cloudflare Workers |
|---|---|---|
| Zaten kullanıyorsan | ✅ ek servis yok | ek hesap gerekir |
| Çalışma ortamı | Deno | V8 isolate |
| Ücretsiz katman | 500 bin çağrı/ay | 100 bin istek/gün |

Uygulama tarafında hiçbir fark yok: `.env` içindeki `EXPO_PUBLIC_AI_PROXY_URL` hangisini gösteriyorsa o kullanılır.

## Kurulum

Komutları **tek tek** çalıştır (Windows PowerShell `&&` desteklemez):

```
npm install -g supabase
supabase login
supabase link --project-ref <PROJE_REF>
supabase secrets set ANTHROPIC_API_KEY
supabase functions deploy interpret --no-verify-jwt
```

- **`<PROJE_REF>`** — Supabase panelinde **Project Settings → General → Reference ID**.
- **`supabase secrets set ANTHROPIC_API_KEY`** anahtarı **sorar**; komut satırına yazma, kabuk geçmişine düz metin kaydolur.
- **`--no-verify-jwt`** gerekir: uygulama Supabase kimlik doğrulaması kullanmıyor. Uç nokta bunun yerine aşağıdaki önlemlerle korunur.

Dağıtım sonunda adresin şu olur:

```
https://<PROJE_REF>.supabase.co/functions/v1/interpret
```

Bunu proje kökündeki `.env` dosyasına yaz:

```
EXPO_PUBLIC_AI_PROXY_URL=https://<PROJE_REF>.supabase.co/functions/v1/interpret
```

## Kötüye kullanıma karşı

Uç nokta herkese açık olduğu için üç katman var:

1. **Girdi kısıtı (kodda hazır).** Fonksiyon yalnızca `natal` / `daily` / `synastry` türlerini ve 50–60.000 karakter arası harita verisini kabul eder; istemi kendisi kurar. Yani genel amaçlı bir Claude geçidine dönüşemez.
2. **`APP_TOKEN` (isteğe bağlı).** Tanımlarsan istemcinin `X-App-Token` göndermesi gerekir:
   ```
   supabase secrets set APP_TOKEN
   ```
   ve `.env` içine `EXPO_PUBLIC_AI_PROXY_TOKEN=<aynı değer>`. Bu değer de APK'dan okunabilir — güvenlik değil, rastgele kullanıma karşı bir eşik.
3. **Harcama limiti (asıl koruma).** Anthropic Console → **Billing → Usage limits** → aylık üst sınır. Bunu mutlaka ayarla.

## Yerel test

```
supabase functions serve interpret --no-verify-jwt
```

Başka bir terminalde:

```
curl -X POST http://localhost:54321/functions/v1/interpret -H "Content-Type: application/json" -d "{\"kind\":\"natal\",\"effort\":\"low\",\"data\":\"# Doğum Haritası\n## Gezegenler\n- Güneş: 24°06' İkizler, 9. ev\n- Ay: 15°04' Balık, 5. ev\n- Yükselen: 8°30' Terazi\"}"
```

## İstem kaynağı

Sistem istemi ve kullanıcı istemi `../../src/ai/promptText.ts` dosyasından gelir — uygulama, Cloudflare Worker ve bu fonksiyon **aynı metni** paylaşır. Yorumların üslubunu değiştirmek için `src/ai/houseStyle.ts` dosyasını düzenle, sonra fonksiyonu yeniden dağıt.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic anahtarı. Yalnızca burada durur. |
| `APP_TOKEN` | — | Tanımlıysa `X-App-Token` başlığı zorunlu olur. |
| `ALLOWED_ORIGINS` | — | Web sürümü için virgülle ayrılmış origin listesi; varsayılan `*`. |
