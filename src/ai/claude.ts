/**
 * Claude ile astrolojik yorum üretimi.
 *
 * İki mod:
 *  - direct : Kullanıcının kendi Anthropic API anahtarı (cihazda güvenli saklanır)
 *  - proxy  : Anahtarı sunucuda tutan küçük bir vekil uç nokta (server/ klasörüne bak)
 */
import Anthropic from '@anthropic-ai/sdk';

import type { Settings } from '@/store/useAppStore';

import { buildUserPrompt, SYSTEM_PROMPT, type InterpretationKind } from './prompts';
import { getApiKey } from './secure';

export const AI_MODEL = 'claude-opus-5';

export interface InterpretRequest {
  kind: InterpretationKind;
  /** serializeChart / serializeTransits / serializeSynastry çıktısı */
  data: string;
  effort: Settings['aiEffort'];
}

export interface InterpretResult {
  text: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export class AiError extends Error {
  constructor(
    message: string,
    public readonly code: 'no-key' | 'auth' | 'rate-limit' | 'network' | 'refusal' | 'proxy' | 'unknown' | 'disabled',
  ) {
    super(message);
    this.name = 'AiError';
  }
}

export async function interpretDirect(apiKey: string, req: InterpretRequest): Promise<InterpretResult> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true, maxRetries: 2 });
  try {
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      thinking: { type: 'adaptive' },
      output_config: { effort: req.effort },
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: buildUserPrompt(req.kind, req.data) }],
    });

    if (response.stop_reason === 'refusal') {
      throw new AiError('Yorum üretilemedi: istek güvenlik nedeniyle reddedildi.', 'refusal');
    }

    let text = '';
    for (const block of response.content) {
      if (block.type === 'text') text += block.text;
    }
    if (!text.trim()) throw new AiError('Modelden boş yanıt geldi.', 'unknown');
    if (response.stop_reason === 'max_tokens') text += '\n\n_(Yorum uzunluk sınırına ulaştığı için kesildi.)_';

    return {
      text,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e instanceof Anthropic.AuthenticationError) throw new AiError('API anahtarı geçersiz. Ayarlar’dan kontrol et.', 'auth');
    if (e instanceof Anthropic.PermissionDeniedError) throw new AiError('Bu anahtarın bu modele erişimi yok.', 'auth');
    if (e instanceof Anthropic.RateLimitError) throw new AiError('Çok fazla istek. Biraz sonra tekrar dene.', 'rate-limit');
    if (e instanceof Anthropic.APIConnectionError) throw new AiError('Bağlantı kurulamadı. İnternetini kontrol et.', 'network');
    if (e instanceof Anthropic.APIError) throw new AiError(`API hatası (${e.status ?? '?'}): ${e.message}`, 'unknown');
    throw new AiError(e instanceof Error ? e.message : 'Bilinmeyen hata', 'unknown');
  }
}

/**
 * Vekil sunucu sözleşmesi:
 *   POST { kind, data, effort }  →  200 { text, model }
 *   Hata: { error: string }
 */
export async function interpretViaProxy(url: string, req: InterpretRequest, token?: string): Promise<InterpretResult> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { 'X-App-Token': token } : {}) },
      body: JSON.stringify({ kind: req.kind, data: req.data, effort: req.effort }),
    });
  } catch {
    throw new AiError('Vekil sunucuya ulaşılamadı.', 'network');
  }
  let json: { text?: string; model?: string; error?: string } = {};
  try {
    json = await res.json();
  } catch {
    /* boş gövde */
  }
  if (!res.ok || !json.text) {
    throw new AiError(json.error ?? `Vekil sunucu hatası (${res.status})`, 'proxy');
  }
  return { text: json.text, model: json.model ?? AI_MODEL };
}

export async function interpret(settings: Settings, req: InterpretRequest): Promise<InterpretResult> {
  if (settings.aiMode === 'off') throw new AiError('Yapay zekâ yorumu kapalı. Ayarlar’dan aç.', 'disabled');
  if (settings.aiMode === 'proxy') {
    if (!settings.aiProxyUrl.trim()) throw new AiError('Vekil sunucu adresi girilmemiş.', 'proxy');
    return interpretViaProxy(settings.aiProxyUrl.trim(), req, settings.aiProxyToken.trim() || undefined);
  }
  const key = await getApiKey();
  if (!key) throw new AiError('API anahtarı yok. Ayarlar’dan Anthropic API anahtarını gir.', 'no-key');
  return interpretDirect(key, req);
}
