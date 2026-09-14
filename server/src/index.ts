/**
 * Doğum Haritası — yapay zekâ yorumu vekili (Cloudflare Worker).
 *
 * Uygulama API anahtarını cihazda taşımak yerine bu uç noktaya istek atar;
 * anahtar yalnızca Worker gizli değişkeninde (ANTHROPIC_API_KEY) durur.
 *
 * Sözleşme (src/ai/claude.ts → interpretViaProxy):
 *   POST /interpret  { kind: 'natal'|'daily'|'synastry', data: string, effort: 'low'|'medium'|'high' }
 *   200 { text, model }   |   4xx/5xx { error }
 */
import Anthropic from '@anthropic-ai/sdk';

import { LOCALE_ORDER, type Locale } from '../../src/i18n/locales';
import { buildUserPrompt, systemPrompt, type InterpretationKind } from '../../src/ai/promptText';
import { THEME_ORDER, type InterpretationTheme } from '../../src/ai/themes';

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** İsteğe bağlı: istemcinin göndermesi gereken paylaşımlı sır (X-App-Token) */
  APP_TOKEN?: string;
  /** İsteğe bağlı: virgülle ayrılmış izinli origin listesi (web için CORS) */
  ALLOWED_ORIGINS?: string;
}

const MODEL = 'claude-opus-5';
const KINDS: InterpretationKind[] = ['natal', 'daily', 'forecast', 'synastry'];
const EFFORTS = ['low', 'medium', 'high'] as const;

function cors(env: Env, req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? '*').split(',').map((s) => s.trim());
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin || '*' : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Token',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const headers = cors(env, req);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(req.url);
    if (req.method !== 'POST' || url.pathname !== '/interpret') return json({ error: 'Not found' }, 404, headers);

    if (env.APP_TOKEN && req.headers.get('X-App-Token') !== env.APP_TOKEN) {
      return json({ error: 'Yetkisiz' }, 401, headers);
    }

    let body: { kind?: string; data?: string; effort?: string; theme?: string; locale?: string };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Geçersiz JSON' }, 400, headers);
    }
    const kind = KINDS.find((k) => k === body.kind);
    const effort = EFFORTS.find((e) => e === body.effort) ?? 'medium';
    const theme: InterpretationTheme = THEME_ORDER.find((t) => t === body.theme) ?? 'general';
    const locale: Locale = LOCALE_ORDER.find((l) => l === body.locale) ?? 'en';
    if (!kind || typeof body.data !== 'string' || body.data.length < 50 || body.data.length > 60_000) {
      return json({ error: 'Geçersiz istek' }, 400, headers);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    try {
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        thinking: { type: 'adaptive' },
        output_config: { effort },
        system: [{ type: 'text', text: systemPrompt(locale), cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: buildUserPrompt(kind, body.data, theme) }],
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
  },
};
