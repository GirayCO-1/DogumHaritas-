import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { AiError, interpret } from '@/ai/claude';
import {
  THEMES,
  interpretationKey,
  serializeChart,
  serializeSynastry,
  serializeTransits,
  type InterpretationKind,
  type InterpretationTheme,
} from '@/ai/prompts';
import { computeSynastry } from '@/astro/synastry';
import { computeTransits } from '@/astro/transits';
import { Markdown } from '@/components/Markdown';
import { Button, Card, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { useNatalChart } from '@/hooks/useChart';
import { useAppStore } from '@/store/useAppStore';

const TITLES: Record<InterpretationKind, string> = {
  natal: 'Doğum Haritası Yorumu',
  daily: 'Günün Yorumu',
  forecast: 'Tarih Öngörüsü',
  synastry: 'İlişki Yorumu',
};

/** "2028-04-20" → o günün yerel öğlen anı (saat dilimi sürprizi olmasın) */
function parseIsoDay(iso: string | undefined, fallback: number): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!m) {
    const d = new Date(fallback);
    d.setHours(12, 0, 0, 0);
    return d;
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
}

function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function InterpretScreen() {
  const Colors = useColors();
  const params = useLocalSearchParams<{ kind?: string; a?: string; b?: string; offset?: string; date?: string; theme?: string }>();
  const router = useRouter();
  const kind = (['natal', 'daily', 'forecast', 'synastry'].includes(params.kind ?? '') ? params.kind : 'natal') as InterpretationKind;
  const theme = (params.theme && params.theme in THEMES ? params.theme : 'general') as InterpretationTheme;
  const profiles = useAppStore((s) => s.profiles);
  const settings = useAppStore((s) => s.settings);
  const interpretations = useAppStore((s) => s.interpretations);
  const setInterpretation = useAppStore((s) => s.setInterpretation);

  const profileA = profiles.find((p) => p.id === params.a);
  const profileB = profiles.find((p) => p.id === params.b);
  const chartA = useNatalChart(profileA);
  const chartB = useNatalChart(profileB);
  const offsetDays = Number(params.offset ?? '0') || 0;
  const [now] = useState(() => Date.now());

  /** Modelin göreceği veri ve önbellek anahtarı */
  const payload = useMemo(() => {
    if (!chartA) return null;
    if (kind === 'natal') {
      const data = serializeChart(chartA);
      return { data, key: interpretationKey('natal', [chartA.input.name ?? '', params.a ?? '', theme], data) };
    }
    if (kind === 'daily' || kind === 'forecast') {
      const day = params.date ? parseIsoDay(params.date, now) : parseIsoDay(undefined, now + offsetDays * 86400000);
      const report = computeTransits(chartA, day);
      // Öngörüde modele tarihin bugünden ne kadar uzak olduğu da söylenir
      const data = `${serializeChart(chartA, 'Natal harita')}\n\n${serializeTransits(report, chartA, kind === 'forecast' ? new Date(now) : undefined)}`;
      return { data, key: interpretationKey(kind, [params.a ?? '', toIsoDay(day), theme], data) };
    }
    if (!chartB) return null;
    const rep = computeSynastry(chartA, chartB);
    const data = `${serializeChart(chartA, `Kişi A`)}\n\n${serializeChart(chartB, `Kişi B`)}\n\n${serializeSynastry(chartA, chartB, rep)}`;
    return { data, key: interpretationKey('synastry', [params.a ?? '', params.b ?? '', theme], data) };
  }, [chartA, chartB, kind, params.a, params.b, params.date, offsetDays, now, theme]);

  const cached = payload ? interpretations[payload.key] : undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AiError | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(async () => {
    if (!payload) return;
    setLoading(true);
    setError(null);
    try {
      const res = await interpret(settings, { kind, data: payload.data, effort: settings.aiEffort, theme });
      setInterpretation(payload.key, { text: res.text, createdAt: Date.now(), model: res.model });
    } catch (e) {
      setError(e instanceof AiError ? e : new AiError(String(e), 'unknown'));
    } finally {
      setLoading(false);
    }
  }, [payload, settings, kind, theme, setInterpretation]);

  // Yorum yoksa ve AI açıksa otomatik başlat
  useEffect(() => {
    if (!payload || cached || settings.aiMode === 'off' || loading || error) return;
    const id = setTimeout(run, 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload?.key, settings.aiMode]);

  const copy = async () => {
    if (!cached) return;
    await Clipboard.setStringAsync(cached.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const themeLabel = theme === 'general' ? '' : ` · ${THEMES[theme].name}`;
  const dayLabel =
    kind === 'forecast' && params.date
      ? ` · ${parseIsoDay(params.date, now).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}`
      : kind === 'daily'
        ? ` · ${offsetDays === 0 ? 'bugün' : offsetDays === 1 ? 'yarın' : offsetDays === -1 ? 'dün' : `${offsetDays > 0 ? '+' : ''}${offsetDays} gün`}`
        : '';
  const subtitle =
    kind === 'synastry'
      ? `${profileA?.name ?? '?'} & ${profileB?.name ?? '?'}${themeLabel}`
      : `${profileA?.name ?? ''}${dayLabel}${themeLabel}`;

  return (
    <>
      <Stack.Screen options={{ title: TITLES[kind] }} />
      <Screen edges={['bottom']}>
        <T variant="small">{subtitle}</T>

        {!payload && (
          <Card>
            <T color={Colors.danger}>Harita verisi bulunamadı.</T>
          </Card>
        )}

        {payload && settings.aiMode === 'off' && !cached && (
          <Card tone="primary">
            <Row gap={8}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <T variant="subheading">Yapay zekâ yorumu kapalı</T>
            </Row>
            <T variant="small">
              Kişiye özel yorum almak için Ayarlar’dan Claude’u etkinleştir: kendi Anthropic API anahtarını gir ya da bir vekil sunucu adresi tanımla.
            </T>
            <Button title="Ayarları Aç" icon="settings-outline" variant="secondary" onPress={() => router.push('/settings')} />
          </Card>
        )}

        {loading && (
          <Card style={{ alignItems: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <T variant="subheading" style={{ marginTop: 12 }}>
              Yorum hazırlanıyor…
            </T>
            <T variant="small" style={{ textAlign: 'center' }}>
              Harita inceleniyor. Bu işlem derinliğe göre 20–90 saniye sürebilir.
            </T>
          </Card>
        )}

        {error && !loading && (
          <Card style={{ borderColor: 'rgba(240,100,122,0.5)' }}>
            <Row gap={8}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <T variant="subheading" color={Colors.danger}>
                Yorum alınamadı
              </T>
            </Row>
            <T variant="small">{error.message}</T>
            <Row gap={8}>
              {(error.code === 'no-key' || error.code === 'auth' || error.code === 'proxy' || error.code === 'disabled') && (
                <Button title="Ayarlar" small variant="secondary" icon="settings-outline" onPress={() => router.push('/settings')} />
              )}
              <Button title="Tekrar Dene" small icon="refresh" onPress={run} />
            </Row>
          </Card>
        )}

        {cached && !loading && (
          <>
            <Card>
              <Markdown text={cached.text} />
            </Card>
            <Row gap={8} style={{ justifyContent: 'space-between' }}>
              <T variant="caption">
                {new Date(cached.createdAt).toLocaleString('tr-TR')} · {cached.model}
              </T>
              <Row gap={8}>
                <Button title={copied ? 'Kopyalandı' : 'Kopyala'} small variant="ghost" icon="copy-outline" onPress={copy} />
                <Button title="Yenile" small variant="ghost" icon="refresh" onPress={run} disabled={settings.aiMode === 'off'} />
              </Row>
            </Row>
            <T variant="caption" style={{ textAlign: 'center' }}>
              Bu yorum yapay zekâ tarafından üretilmiştir; eğlence ve kişisel keşif amaçlıdır.
            </T>
          </>
        )}
      </Screen>
    </>
  );
}
