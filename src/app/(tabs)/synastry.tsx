import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { BODIES, PLANET_ORDER } from '@/astro/constants';
import { SYNASTRY_CATEGORY_NAMES } from '@/astro/synastry';
import { AspectList } from '@/components/ChartTables';
import { ChartWheel } from '@/components/ChartWheel';
import { BodyGlyph } from '@/components/Glyph';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { Bar, Button, Card, EmptyState, Row, Screen, T } from '@/components/ui';
import { MaxContentWidth, Spacing, useColors, type Palette } from '@/constants/theme';
import { useNatalChart, useSynastry } from '@/hooks/useChart';
import { useAppStore } from '@/store/useAppStore';

function scoreColor(score: number, c: Palette): string {
  if (score >= 70) return c.success;
  if (score >= 45) return c.primary;
  return c.danger;
}

export default function SynastryScreen() {
  const Colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profiles = useAppStore((s) => s.profiles);
  const hydrated = useAppStore((s) => s.hydrated);
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  const a = useMemo(() => profiles.find((p) => p.id === aId) ?? profiles.find((p) => p.isSelf) ?? profiles[0], [profiles, aId]);
  const b = useMemo(() => profiles.find((p) => p.id === bId && p.id !== a?.id) ?? profiles.find((p) => p.id !== a?.id), [profiles, bId, a]);
  const chartA = useNatalChart(a);
  const chartB = useNatalChart(b);
  const report = useSynastry(chartA, chartB);

  if (!hydrated) return <Screen scroll={false}>{null}</Screen>;

  if (profiles.length < 2) {
    return (
      <Screen>
        <EmptyState
          icon="heart-outline"
          title="İlişki uyumu (sinastri)"
          text="İki haritayı karşılaştırmak için en az iki kişi gerekir. Partnerinin, arkadaşının ya da bir aile üyenin haritasını ekle."
          action={<Button title={profiles.length ? 'İkinci Kişiyi Ekle' : 'Kişi Ekle'} icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      </Screen>
    );
  }

  const wheelSize = Math.min(width - Spacing.three * 2, MaxContentWidth - Spacing.three * 2, 460);

  return (
    <Screen>
      <T variant="label">Sinastri · İlişki uyumu</T>
      <View style={{ gap: 6 }}>
        <T variant="caption">1. kişi</T>
        <ProfileChips selectedId={a?.id} onSelect={setAId} />
        <T variant="caption">2. kişi</T>
        <ProfileChips selectedId={b?.id} onSelect={setBId} exclude={a?.id} />
      </View>

      {a && b && chartA && chartB && report && (
        <>
          <Card tone="strong" style={{ alignItems: 'center', gap: 4 }}>
            <T variant="label">
              {a.name} & {b.name}
            </T>
            <T variant="display" style={{ fontSize: 56, lineHeight: 66, color: scoreColor(report.score, Colors) }}>{report.score}</T>
            <T variant="small">/ 100 genel uyum</T>
          </Card>

          <Card>
            {(Object.keys(report.categories) as (keyof typeof report.categories)[]).map((k) => (
              <Row key={k} gap={10}>
                <T variant="small" style={{ width: 118 }}>
                  {SYNASTRY_CATEGORY_NAMES[k]}
                </T>
                <Bar value={report.categories[k]} color={scoreColor(report.categories[k], Colors)} />
                <T variant="mono" style={{ width: 30, textAlign: 'right' }}>
                  {report.categories[k]}
                </T>
              </Row>
            ))}
          </Card>

          <View style={{ alignItems: 'center' }}>
            <ChartWheel
              chart={chartA}
              size={wheelSize}
              showAspects
              outer={chartB.planets.filter((p) => p.id !== 'southNode' && p.id !== 'lilith')}
              outerLabel={`İç: ${a.name} · Dış: ${b.name}`}
              crossAspects={report.aspects.map((x) => ({ ...x, a: x.personB, b: x.personA }))}
            />
          </View>

          <Button
            title="İlişki Yorumu Al"
            icon="sparkles"
            variant="secondary"
            onPress={() => router.push({ pathname: '/interpret', params: { kind: 'synastry', a: a.id, b: b.id } })}
          />

          <T variant="heading">Karşılıklı Açılar</T>
          <AspectList aspects={report.aspects} labelA={a.name} labelB={b.name} />

          <T variant="heading">Evlere Düşüşler</T>
          <Row gap={Spacing.two} align="flex-start">
            <Card style={{ flex: 1, gap: 4 }}>
              <T variant="caption">
                {a.name} → {b.name}’nin evleri
              </T>
              {PLANET_ORDER.filter((id) => id !== 'southNode' && id !== 'lilith').map((id) => (
                <Row key={id} gap={6}>
                  <BodyGlyph id={id} size={14} />
                  <T variant="small" style={{ flex: 1 }}>
                    {BODIES[id].shortName}
                  </T>
                  <T variant="mono">{report.housesAinB[id]}. ev</T>
                </Row>
              ))}
            </Card>
            <Card style={{ flex: 1, gap: 4 }}>
              <T variant="caption">
                {b.name} → {a.name}’nın evleri
              </T>
              {PLANET_ORDER.filter((id) => id !== 'southNode' && id !== 'lilith').map((id) => (
                <Row key={id} gap={6}>
                  <BodyGlyph id={id} size={14} />
                  <T variant="small" style={{ flex: 1 }}>
                    {BODIES[id].shortName}
                  </T>
                  <T variant="mono">{report.housesBinA[id]}. ev</T>
                </Row>
              ))}
            </Card>
          </Row>
        </>
      )}
    </Screen>
  );
}
