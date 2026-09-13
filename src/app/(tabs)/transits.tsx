import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { BODIES, SIGNS } from '@/astro/constants';
import { formatLocal } from '@/astro/time';
import { AspectList } from '@/components/ChartTables';
import { ChartWheel } from '@/components/ChartWheel';
import { BodyGlyph, SignGlyph } from '@/components/Glyph';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { Badge, Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNatalChart, useTransits } from '@/hooks/useChart';
import { useAppStore } from '@/store/useAppStore';

const DAY = 86400000;

export default function TransitsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const hydrated = useAppStore((s) => s.hydrated);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [offsetDays, setOffsetDays] = useState(0);
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
          text="Bugünün gökyüzünün doğum haritanla yaptığı açıları görmek için önce bir profil oluştur."
          action={<Button title="Profil Oluştur" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      </Screen>
    );
  }

  const wheelSize = Math.min(width - Spacing.three * 2, MaxContentWidth - Spacing.three * 2, 460);
  const dayLabel = offsetDays === 0 ? 'Bugün' : offsetDays === 1 ? 'Yarın' : offsetDays === -1 ? 'Dün' : `${offsetDays > 0 ? '+' : ''}${offsetDays} gün`;

  return (
    <Screen>
      <T variant="label">Günlük Transitler</T>
      <ProfileChips selectedId={profile.id} onSelect={setProfileId} />

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Pressable onPress={() => setOffsetDays((d) => d - 1)} hitSlop={10} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <T variant="heading">{dayLabel}</T>
            <T variant="small">{chart ? formatLocal(date, chart.meta.timeZone) : ''}</T>
          </View>
          <Pressable onPress={() => setOffsetDays((d) => d + 1)} hitSlop={10} style={{ padding: 6 }}>
            <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
          </Pressable>
        </Row>
        {offsetDays !== 0 && (
          <Row style={{ justifyContent: 'center' }}>
            <Chip label="Bugüne dön" icon="today-outline" onPress={() => setOffsetDays(0)} />
          </Row>
        )}
      </Card>

      {chart && report && (
        <>
          <Row gap={Spacing.two}>
            <Card style={{ flex: 1 }}>
              <T variant="label">Ay Evresi</T>
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

          <Button
            title="Günün Yorumunu Al"
            icon="sparkles"
            variant="secondary"
            onPress={() => router.push({ pathname: '/interpret', params: { kind: 'daily', a: profile.id, offset: String(offsetDays) } })}
          />

          <T variant="heading">Transit → Natal Açılar</T>
          <AspectList aspects={report.aspects} labelA="Transit" labelB="Natal" emptyText="Bu gün için belirgin bir transit açısı yok." />

          <T variant="heading">Transit Gezegenler</T>
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
    </Screen>
  );
}
