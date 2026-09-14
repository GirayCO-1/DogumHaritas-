import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { THEMES, THEME_ORDER, type InterpretationTheme } from '@/ai/prompts';
import { BODIES } from '@/astro/constants';
import { buildDailyBrief, type BriefItem } from '@/astro/daily';
import { formatLocal } from '@/astro/time';
import type { BodyId } from '@/astro/types';
import { Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { ChartView } from '@/components/ChartView';
import { DailySky } from '@/components/DailySky';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { FontFamily, Radius, Spacing, forEachScheme, useColors, useScheme, type Palette } from '@/constants/theme';
import { useNatalChart, useTransits } from '@/hooks/useChart';
import { useActiveProfile, useAppStore } from '@/store/useAppStore';

type Tab = 'today' | 'chart';

const bodyName = (id: BodyId) => BODIES[id].name;

/** Günün özeti yerel öğleye göre hesaplanır: gün boyunca aynı kalır. */
function noonOf(ms: number): Date {
  const d = new Date(ms);
  d.setHours(12, 0, 0, 0);
  return d;
}

export default function HomeScreen() {
  const Colors = useColors();
  const s = styleSets[useScheme()];
  const router = useRouter();
  const profile = useActiveProfile();
  const setActive = useAppStore((st) => st.setActiveProfile);
  const hydrated = useAppStore((st) => st.hydrated);
  const showMinor = useAppStore((st) => st.settings.showMinorAspects);
  const chart = useNatalChart(profile);
  const [tab, setTab] = useState<Tab>('today');
  const [theme, setTheme] = useState<InterpretationTheme>('general');

  // Sekmeye her dönüşte gün tazelenir; gün değişmediyse özet aynı kalır.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useFocusEffect(
    useCallback(() => {
      setNowMs(Date.now());
    }, []),
  );
  const noon = useMemo(() => noonOf(nowMs), [nowMs]);
  const report = useTransits(chart, noon);
  const brief = useMemo(() => (report ? buildDailyBrief(report, bodyName) : null), [report]);

  const share = useCallback(() => {
    if (!brief) return;
    // Paylaşım her platformda yok (web'de tarayıcıya bağlı); başarısız olursa
    // sessizce geçilir, ekran kırılmaz.
    try {
      void Share.share({ message: `${brief.pulse}\n\n— Doğum Haritası` })?.catch?.(() => {});
    } catch {
      /* paylaşım desteklenmiyor */
    }
  }, [brief]);

  if (!hydrated) return <Screen scroll={false}>{null}</Screen>;

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          icon="sparkles-outline"
          title="Güne haritanla başla"
          text="Doğum tarihi, saati ve yerini gir; bugünün gökyüzünün sana ne söylediğini her sabah burada gör."
          action={<Button title="Harita Oluştur" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      </Screen>
    );
  }

  const today = noon.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
  const birthLine = chart ? formatLocal(chart.meta.utc, chart.meta.timeZone, !profile.timeUnknown) : `${profile.day}.${profile.month}.${profile.year}`;

  return (
    <Screen contentStyle={{ gap: Spacing.three }}>
      <View style={{ gap: 2 }}>
        <T variant="display">Merhaba, {profile.name.split(' ')[0]}</T>
        <T variant="small">{today}</T>
      </View>

      <ProfileChips selectedId={profile.id} onSelect={setActive} />

      <SegmentedTabs value={tab} onChange={setTab} />

      {tab === 'today' ? (
        !brief ? (
          <Card>
            <T color={Colors.danger}>Bugünün gökyüzü hesaplanamadı. Kişi bilgilerini kontrol et.</T>
          </Card>
        ) : (
          <>
            {/* Kozmik nabız — günün en belirleyici transitinden türeyen tek
                cümle; zemin de o gezegene göre her gün değişiyor */}
            <DailySky day={brief.day} body={brief.pulseBody}>
              <View style={s.pulseCard}>
                <View style={s.pulseBadge}>
                  <T variant="caption" color={Colors.textSecondary}>
                    Kozmik nabız
                  </T>
                </View>
                <T variant="heading" style={s.pulseText}>
                  {brief.pulse}
                </T>
                <Pressable onPress={share} hitSlop={8}>
                  <T variant="small" color={Colors.textSecondary} style={s.shareLink}>
                    Sosyal medyada paylaş
                  </T>
                </Pressable>
                <T variant="caption" style={{ textAlign: 'center' }}>
                  {brief.pulseSource}
                </T>
              </View>
            </DailySky>

            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T variant="small">Enerji seviyen</T>
                  <T variant="display">%{brief.energy}</T>
                  <T variant="caption">{brief.moonLine}</T>
                </View>
                <EnergyRing value={brief.energy} c={Colors} />
              </Row>
            </Card>

            <BriefList
              title="Bugün güçlü yanların"
              icon="trending-up"
              tint={Colors.success}
              items={brief.strengths}
              empty="Bugün natal haritanla dar bir uyumlu açı yok; kendi ritmini kurmak sana kalmış."
            />
            <BriefList
              title="Dikkat edilecekler"
              icon="alert-circle"
              tint={Colors.warning}
              items={brief.cautions}
              empty="Bugün zorlayıcı bir açı görünmüyor. Rahat bir gün."
            />
          </>
        )
      ) : !chart ? (
        <Card>
          <T color={Colors.danger}>Harita hesaplanamadı. Kişi bilgilerini kontrol et.</T>
        </Card>
      ) : (
        <>
          <T variant="small">
            {birthLine} · {profile.placeName}
          </T>

          <ChartView chart={chart} profile={profile} showMinor={showMinor} />

          {/* Yorum daveti — sorulan bir soru gibi, dolu bir kutu gibi değil */}
          <Card tone="primary" flat style={{ gap: Spacing.three }}>
            <View style={{ gap: 2 }}>
              <T variant="heading">Bugün neyi merak ediyorsun?</T>
              <T variant="small">{THEMES[theme].tagline}</T>
            </View>
            <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
              {THEME_ORDER.map((t) => (
                <Chip
                  key={t}
                  label={THEMES[t].name}
                  icon={THEMES[t].icon as never}
                  active={theme === t}
                  onPress={() => setTheme(t)}
                  style={theme === t ? undefined : s.themeChip}
                />
              ))}
            </Row>
            <Button
              title="Haritamı Yorumla"
              icon="sparkles"
              onPress={() => router.push({ pathname: '/interpret', params: { kind: 'natal', a: profile.id, theme } })}
            />
          </Card>
        </>
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */

function SegmentedTabs({ value, onChange }: { value: Tab; onChange: (t: Tab) => void }) {
  const Colors = useColors();
  const s = styleSets[useScheme()];
  const tabs: [Tab, string][] = [
    ['today', 'Bugün'],
    ['chart', 'Haritam'],
  ];
  return (
    <Row gap={Spacing.four} style={s.segments}>
      {tabs.map(([k, label]) => {
        const active = value === k;
        return (
          <Pressable key={k} onPress={() => onChange(k)} style={[s.segment, active && { borderBottomColor: Colors.primary }]}>
            <T variant="subheading" color={active ? Colors.text : Colors.muted}>
              {label}
            </T>
          </Pressable>
        );
      })}
    </Row>
  );
}

function BriefList({
  title,
  icon,
  tint,
  items,
  empty,
}: {
  title: string;
  icon: 'trending-up' | 'alert-circle';
  tint: string;
  items: BriefItem[];
  empty: string;
}) {
  const s = styleSets[useScheme()];
  return (
    <View style={{ gap: Spacing.two }}>
      <Row gap={7}>
        <Ionicons name={icon} size={17} color={tint} />
        <T variant="label">{title}</T>
      </Row>
      {items.length === 0 ? (
        <Card>
          <T variant="small">{empty}</T>
        </Card>
      ) : (
        items.map((it) => (
          <Card key={it.source} style={{ gap: 5 }}>
            <Row gap={Spacing.two} align="flex-start">
              <View style={[s.dot, { backgroundColor: tint }]} />
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="subheading">{it.title}</T>
                <T variant="small">{it.text}</T>
                <T variant="caption">{it.source}</T>
              </View>
            </Row>
          </Card>
        ))
      )}
    </View>
  );
}

/** Enerji seviyesini gösteren halka */
function EnergyRing({ value, c }: { value: number; c: Palette }) {
  const size = 82;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, value)) / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.cardStrong} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={c.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${filled} ${circ}`}
          // 12 yönünden başlasın
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Ionicons name="sparkles" size={24} color={c.accent} />
    </View>
  );
}

const styleSets = forEachScheme((c) =>
  StyleSheet.create({
    segments: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    segment: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    pulseCard: {
      paddingVertical: Spacing.four,
      paddingHorizontal: Spacing.three,
      alignItems: 'center',
      gap: Spacing.three,
    },
    pulseBadge: {
      backgroundColor: c.scheme === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.10)',
      borderRadius: Radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    pulseText: { textAlign: 'center', fontFamily: FontFamily.display, fontSize: 19, lineHeight: 29 },
    shareLink: { textDecorationLine: 'underline' },
    dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
    // Davet kartının zemini zaten tonlu; etkin olmayan çipler beyaz kalsın
    themeChip: { backgroundColor: c.card },
  }),
);
