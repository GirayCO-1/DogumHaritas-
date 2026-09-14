/**
 * Doğum Haritası — yapay zekâ yorumu vekili (Supabase Edge Function / Deno).
 *
 * Cloudflare Worker (server/) ile aynı işi yapar ve aynı sözleşmeyi konuşur;
 * hangisini kullanacağın sana kalmış. Zaten Supabase kullanıyorsan bu yeterli,
 * Cloudflare'e gerek yok.
 *
 * Anahtar Supabase gizli değişkeninde (ANTHROPIC_API_KEY) durur, uygulamaya
 * hiçbir zaman inmez.
 *
 * Sözleşme (src/ai/claude.ts → interpretViaProxy):
 *   POST  { kind: 'natal'|'daily'|'synastry', data: string, effort: 'low'|'medium'|'high' }
 *   200   { text, model }   |   4xx/5xx { error }
 *
 * Kurulum:
 *   supabase secrets set ANTHROPIC_API_KEY        (değeri sorar)
 *   npm run deploy:supabase                       (önce _shared'ı tazeler)
 */
import Anthropic from 'npm:@anthropic-ai/sdk@^0.125.0';

import { SYSTEM_PROMPT, buildUserPrompt, type InterpretationKind } from '../_shared/promptText.ts';

const MODEL = 'claude-opus-5';
const KINDS: InterpretationKind[] = ['natal', 'daily', 'synastry'];
const EFFORTS = ['low', 'medium', 'high'] as const;

/** İsteğe bağlı paylaşımlı sır; tanımlıysa istemcinin X-App-Token göndermesi beklenir */
const APP_TOKEN = Deno.env.get('APP_TOKEN') ?? '';
/** Virgülle ayrılmış izinli origin listesi (web sürümü için); boşsa hepsi */
const ALLOWED_ORIGINS = Deno.env.get('ALLOWED_ORIGINS') ?? '*';

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.split(',').map((s) => s.trim());
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Token, Authorization',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.method !== 'POST') return json({ error: 'Yalnızca POST' }, 405, headers);

  if (APP_TOKEN && req.headers.get('X-App-Token') !== APP_TOKEN) {
    return json({ error: 'Yetkisiz' }, 401, headers);
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'Sunucuda ANTHROPIC_API_KEY tanımlı değil' }, 500, headers);

  let body: { kind?: string; data?: string; effort?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Geçersiz JSON' }, 400, headers);
  }

  const kind = KINDS.find((k) => k === body.kind);
  const effort = EFFORTS.find((e) => e === body.effort) ?? 'medium';
  // Uzunluk sınırı: uç noktanın genel amaçlı bir Claude geçidine dönüşmesini engeller
  if (!kind || typeof body.data !== 'string' || body.data.length < 50 || body.data.length > 60_000) {
    return json({ error: 'Geçersiz istek' }, 400, headers);
  }

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort },
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: buildUserPrompt(kind, body.data) }],
    });

    if (response.stop_reason === 'refusal') return json({ error: 'İstek reddedildi' }, 422, headers);

    let text = '';
    for (const block of response.content) if (block.type === 'text') text += block.text;
    if (!text.trim()) return json({ error: 'Boş yanıt' }, 502, headers);

    return json({ text, model: response.model }, 200, headers);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'Çok fazla istek, sonra tekrar dene' }, 429, headers);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'Sunucu anahtarı geçersiz' }, 500, headers);
    if (e instanceof Anthropic.APIError) return json({ error: `API hatası ${e.status ?? ''}`.trim() }, 502, headers);
    return json({ error: 'Beklenmeyen hata' }, 500, headers);
  }
});
