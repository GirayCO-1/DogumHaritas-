# Yorum vekili (Cloudflare Worker)

Uygulamayı mağazada dağıtırken Anthropic API anahtarını cihaza koymak yerine bu küçük vekili yayınla. Uygulama Ayarlar → Yapay Zekâ → **Sunucu vekili** seçeneğine adresi girer; anahtar yalnızca Worker'ın gizli değişkeninde durur.

```bash
cd server
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY     # console.anthropic.com'dan alınan anahtar
npx wrangler secret put APP_TOKEN             # isteğe bağlı: uygulamayla paylaşılan sır
npm run deploy
# → https://dogum-haritasi-proxy.<hesap>.workers.dev
```

Uygulamada adres olarak `https://…workers.dev/interpret` gir.

## Sözleşme

```
POST /interpret
Content-Type: application/json
X-App-Token: <APP_TOKEN>            # tanımlıysa zorunlu

{ "kind": "natal" | "daily" | "synastry", "data": "<harita metni>", "effort": "low" | "medium" | "high" }

200 → { "text": "<markdown>", "model": "claude-opus-5" }
4xx/5xx → { "error": "..." }
```

Sistem istemi ve kullanıcı istemi `../src/ai/promptText.ts` dosyasından paylaşılır; uygulama ile sunucu aynı metni kullanır. Model `claude-opus-5`, uyarlanabilir düşünme, `effort` ile derinlik; sistem istemi prompt cache'e alınır.

> `APP_TOKEN` uygulamaya gömülü olacağı için tam bir güvenlik önlemi değildir; asıl koruma Cloudflare tarafında hız sınırı (Rate Limiting kuralı) ve Anthropic Console'daki harcama limitidir.
