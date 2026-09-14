import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { THEMES, THEME_ORDER, type InterpretationTheme } from '@/ai/prompts';
import { BODIES, SIGNS } from '@/astro/constants';
import { formatLocal } from '@/astro/time';
import { DateJumpModal } from '@/components/DateJumpModal';
import { AspectList } from '@/components/ChartTables';
import { ChartWheel } from '@/components/ChartWheel';
import { BodyGlyph, SignGlyph } from '@/components/Glyph';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { Badge, Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { MaxContentWidth, Spacing, useColors } from '@/constants/theme';
import { useNatalChart, useTransits } from '@/hooks/useChart';
import { useAppStore } from '@/store/useAppStore';

const DAY = 86400000;

function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Seçili tarih bugüne göre nerede duruyor */
function dayLabelFor(offsetDays: number, date: Date): string {
  if (offsetDays === 0) return 'Bugün';
  if (offsetDays === 1) return 'Yarın';
  if (offsetDays === -1) return 'Dün';
  if (Math.abs(offsetDays) <= 30) return `${offsetDays > 0 ? '+' : ''}${offsetDays} gün`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TransitsScreen() {
  const Colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const hydrated = useAppStore((s) => s.hydrated);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [offsetDays, setOffsetDays] = useState(0);
  const [theme, setTheme] = useState<InterpretationTheme>('general');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // Sekmeye her dönüşte "bugün" tazelensin
  useFocusEffect(
    useCallback(() => {
      setNow(Date.now());
    }, []),
  );

  const profile = useMemo(
    () => profiles.find((p) => p.id === profileId) ?? profiles.find((p) => p.isSelf) ?? profiles.find((p) => p.id === activeId) ?? profiles[0],
    [profiles, profileId, activeId],
  );
  const chart = useNatalChart(profile);
  const date = useMemo(() => new Date(now + offsetDays * DAY), [now, offsetDays]);
  const report = useTransits(chart, date);

  if (!hydrated) return <Screen scroll={false}>{null}</Screen>;

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          icon="sunny-outline"
          title="Günlük transitler"
          text="Bugünün gökyüzünün doğum haritanla yaptığı açıları görmek için önce bir kişi ekle."
          action={<Button title="Kişi Ekle" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      </Screen>
    );
  }

  const wheelSize = Math.min(width - Spacing.three * 2, MaxContentWidth - Spacing.three * 2, 460);
  const dayLabel = dayLabelFor(offsetDays, date);
  const isToday = offsetDays === 0;
  // Bugünden uzak tarihlerde günlük yorum değil, dönem öngörüsü istenir
  const kind = Math.abs(offsetDays) > 3 ? 'forecast' : 'daily';

  /** Seçilen takvim gününü bugüne göre gün farkına çevirir */
  const jumpTo = (target: Date) => {
    const a = new Date(now);
    a.setHours(12, 0, 0, 0);
    const b = new Date(target);
    b.setHours(12, 0, 0, 0);
    setOffsetDays(Math.round((b.getTime() - a.getTime()) / DAY));
  };

  return (
    <Screen>
      <T variant="label">Gökyüzü</T>
      <ProfileChips selectedId={profile.id} onSelect={setProfileId} />

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => setOffsetDays((d) => d - 1)} hitSlop={10} style={{ padding: 6 }} accessibilityLabel="Önceki gün">
            <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => setPickerOpen(true)} style={{ alignItems: 'center', flex: 1 }} accessibilityLabel="Tarih seç">
            <Row gap={6}>
              <T variant="heading">{dayLabel}</T>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            </Row>
            <T variant="small">{chart ? formatLocal(date, chart.meta.timeZone) : ''}</T>
          </Pressable>
          <Pressable onPress={() => setOffsetDays((d) => d + 1)} hitSlop={10} style={{ padding: 6 }} accessibilityLabel="Sonraki gün">
            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
          </Pressable>
        </Row>
        {!isToday && (
          <Row style={{ justifyContent: 'center' }}>
            <Chip label="Bugüne dön" icon="today-outline" onPress={() => setOffsetDays(0)} />
          </Row>
        )}
      </Card>

      {chart && report && (
        <>
          <Row gap={Spacing.two}>
            <Card style={{ flex: 1 }}>
              <T variant="label">Ay evresi</T>
              <Row gap={8}>
                <BodyGlyph id="moon" size={22} />
                <View style={{ flex: 1 }}>
                  <T variant="subheading">{report.moonPhase.name}</T>
                  <Row gap={4}>
                    <SignGlyph sign={report.moonPhase.sign} size={14} />
                    <T variant="small">
                      {SIGNS[report.moonPhase.sign].name} · %{Math.round(report.moonPhase.illumination * 100)}
                    </T>
                  </Row>
                </View>
              </Row>
            </Card>
            <Card style={{ flex: 1 }}>
              <T variant="label">Retro</T>
              {report.retrogrades.length ? (
                <Row gap={6} style={{ flexWrap: 'wrap' }}>
                  {report.retrogrades.map((id) => (
                    <Badge key={id} label={`${BODIES[id].symbol} ${BODIES[id].shortName}`} color={Colors.danger} />
                  ))}
                </Row>
              ) : (
                <T variant="small">Retro gezegen yok</T>
              )}
            </Card>
          </Row>

          <View style={{ alignItems: 'center' }}>
            <ChartWheel
              chart={chart}
              size={wheelSize}
              showAspects
              outer={report.transitPositions}
              outerLabel="Dış halka: transit gezegenler"
              crossAspects={report.aspects}
              visibleBodies={['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode']}
            />
          </View>

          <Card>
            <T variant="label">Yorum odağı</T>
            <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
              {THEME_ORDER.map((t) => (
                <Chip key={t} label={THEMES[t].name} active={theme === t} onPress={() => setTheme(t)} />
              ))}
            </Row>
            <T variant="small">{THEMES[theme].tagline}</T>
            <Button
              title={isToday ? 'Günün Yorumunu Al' : 'Bu Tarih İçin Öngörü Al'}
              icon="sparkles"
              onPress={() =>
                router.push({
                  pathname: '/interpret',
                  params: { kind, a: profile.id, offset: String(offsetDays), date: toIsoDay(date), theme },
                })
              }
            />
          </Card>

          <T variant="heading">Gökyüzü → Natal Açılar</T>
          <AspectList aspects={report.aspects} labelA="Transit" labelB="Natal" emptyText="Bu gün için belirgin bir transit açısı yok." />

          <T variant="heading">O Tarihteki Gezegenler</T>
          <Card style={{ gap: 6 }}>
            {report.transitPositions.map((p) => (
              <Row key={p.id} gap={10}>
                <BodyGlyph id={p.id} size={18} />
                <T style={{ flex: 1 }}>{BODIES[p.id].name}</T>
                <SignGlyph sign={p.sign} size={16} />
                <T variant="mono" color={Colors.text}>
                  {p.deg}°{String(p.min).padStart(2, '0')}′ {SIGNS[p.sign].name}
                </T>
                <T variant="caption" style={{ width: 44, textAlign: 'right' }}>
                  {p.house}. ev{p.retrograde ? ' ℞' : ''}
                </T>
              </Row>
            ))}
          </Card>
        </>
      )}
      <DateJumpModal visible={pickerOpen} value={date} onClose={() => setPickerOpen(false)} onSelect={jumpTo} />
    </Screen>
  );
}
