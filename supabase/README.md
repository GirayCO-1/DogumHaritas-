# Supabase Edge Function — yorum vekili

Anthropic API anahtarını kullanıcıların telefonuna koymadan, tüm kullanıcılara tek anahtarla yorum üretmenin yolu. `server/` klasöründeki Cloudflare Worker ile **aynı işi** yapar ve aynı sözleşmeyi konuşur — **ikisine birden ihtiyacın yok**, birini seç.

| | Supabase Edge Functions | Cloudflare Workers |
|---|---|---|
| Zaten kullanıyorsan | ✅ ek servis yok | ek hesap gerekir |
| Çalışma ortamı | Deno | V8 isolate |
| Ücretsiz katman | 500 bin çağrı/ay | 100 bin istek/gün |

Uygulama tarafında hiçbir fark yok: `.env` içindeki `EXPO_PUBLIC_AI_PROXY_URL` hangisini gösteriyorsa o kullanılır.

## Kurulum

### 1. Anahtarı gizli değişken olarak ekle (panelden, CLI gerekmez)

Supabase paneli → **Edge Functions → Secrets → Add new secret**

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |

Anahtar yalnızca burada durur; uygulamaya ya da repoya hiç inmez.

### 2. Fonksiyonu yayımla

Panelden yayımlanmış bir fonksiyon zaten varsa bu adımı atla. CLI ile:

```
npm install -g supabase
supabase login
supabase link --project-ref <PROJE_REF>
npm run deploy:supabase
```

- **`<PROJE_REF>`** — panelde **Project Settings → General → Reference ID**.
- `npm run deploy:supabase` önce `src/ai/` içindeki istemleri `_shared/` altına tazeler, sonra `--no-verify-jwt` ile dağıtır.
- **`--no-verify-jwt`** gerekir: uygulama Supabase kimlik doğrulaması kullanmıyor. Uç nokta bunun yerine aşağıdaki önlemlerle korunur.

### 3. Adresi `.env`'e yaz

```
https://<PROJE_REF>.supabase.co/functions/v1/interpret
```

### 4. Çalıştığını doğrula

```
curl -X POST https://<PROJE_REF>.supabase.co/functions/v1/interpret -H "Content-Type: application/json" -d "{\"kind\":\"natal\",\"effort\":\"low\",\"data\":\"# Harita\n- Gunes: 24 Ikizler, 9. ev\n- Ay: 15 Balik, 5. ev\n- Yukselen: 8 Terazi\"}"
```

| Yanıt | Anlamı |
|---|---|
| `{"text":"## Genel Bakış...` | Her şey çalışıyor |
| `{"error":"Sunucuda ANTHROPIC_API_KEY tanımlı değil"}` | 1. adım eksik |
| `{"error":"Sunucu anahtarı geçersiz"}` | Anahtar yanlış ya da silinmiş |
| `BOOT_ERROR` | Fonksiyon başlayamadı — panelde **Edge Functions → interpret → Logs** |

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

## İstem kaynağı ve `_shared/`

Tek kaynak **`src/ai/promptText.ts` + `src/ai/houseStyle.ts`**; uygulama, Cloudflare Worker ve bu fonksiyon aynı metni paylaşır.

Supabase yalnızca `supabase/functions/` altındaki dosyaları paketlediği için bu iki dosyanın kopyası `_shared/` altında tutulur. Kopyalar **üretilir, elle düzenlenmez**:

```
npm run sync:shared
```

`npm run deploy:supabase` bunu zaten kendisi çalıştırır. Kopyalar eskirse `npm test` kırılır, yani sürüklenme fark edilmeden geçemez.

Yorumların üslubunu değiştirmek için `src/ai/houseStyle.ts` dosyasını düzenle, sonra yeniden dağıt.

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Anthropic anahtarı. Yalnızca burada durur. |
| `APP_TOKEN` | — | Tanımlıysa `X-App-Token` başlığı zorunlu olur. |
| `ALLOWED_ORIGINS` | — | Web sürümü için virgülle ayrılmış origin listesi; varsayılan `*`. |
