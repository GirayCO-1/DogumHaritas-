/**
 * Doğum haritasının gövdesi: çark + üç temel + element dengesi +
 * "Haritanın detayları" bölümü.
 *
 * Hem Harita sekmesinde hem de Anasayfa'nın "Haritam" bölümünde
 * kullanılır; iki yerde aynı içerik iki kez yazılmasın diye ayrıldı.
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { HOUSE_SYSTEM_NAMES } from '@/astro/constants';
import type { BodyId, NatalChart } from '@/astro/types';
import { MaxContentWidth, Radius, Spacing, forEachScheme, useColors, useScheme } from '@/constants/theme';
import type { Profile } from '@/store/useAppStore';

import { ChartWheel } from './ChartWheel';
import { AspectGrid, AspectList, BalanceBars, BigThree, BodyDetail, ElementStrip, HouseTable, PlanetTable } from './ChartTables';
import { Card, Chip, Row, T } from './ui';

type Section = 'planets' | 'houses' | 'aspects' | 'balance';

const SECTIONS: [Section, string][] = [
  ['planets', 'Gezegenler'],
  ['houses', 'Evler'],
  ['aspects', 'Açılar'],
  ['balance', 'Denge'],
];

export function ChartView({
  chart,
  profile,
  showMinor,
}: {
  chart: NatalChart;
  profile: Profile;
  showMinor: boolean;
}) {
  const Colors = useColors();
  const s = styleSets[useScheme()];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<BodyId | null>(null);
  const [section, setSection] = useState<Section>('planets');
  const [showAspects, setShowAspects] = useState(true);

  // Çark, gökyüzü kartının iç boşluğu çıkarıldıktan sonra kalan genişliği alır
  const wheelSize = Math.min(width - Spacing.three * 2 - Spacing.two * 2, MaxContentWidth - Spacing.three * 2, 460);

  return (
    <>
      {/* Çark ekranın kahramanı: kendi gökyüzü zemininde durur */}
      <View style={s.sky}>
        <ChartWheel chart={chart} size={wheelSize} showAspects={showAspects} showMinor={showMinor} selected={selected} onSelect={setSelected} />
        <Row gap={Spacing.two} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip label="Açılar" icon="git-network-outline" active={showAspects} onPress={() => setShowAspects((v) => !v)} />
          <Chip label={HOUSE_SYSTEM_NAMES[chart.houses.system]} icon="grid-outline" onPress={() => router.push('/settings')} />
          {chart.houses.fallbackFrom && <Chip label="Kutup enlemi: Porphyry" color={Colors.warning} active />}
          {profile.timeUnknown && <Chip label="Saat bilinmiyor" color={Colors.warning} active />}
        </Row>
      </View>

      {selected && <BodyDetail chart={chart} id={selected} />}

      <View style={{ gap: Spacing.two }}>
        <T variant="label">Üç temel</T>
        <BigThree chart={chart} />
      </View>

      <ElementStrip elements={chart.elements} />

      <View style={{ gap: Spacing.two }}>
        <T variant="label">Haritanın detayları</T>
        <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
          {SECTIONS.map(([k, label]) => (
            <Chip key={k} label={label} active={section === k} onPress={() => setSection(k)} />
          ))}
        </Row>
      </View>

      {section === 'planets' && <PlanetTable chart={chart} selected={selected} onSelect={setSelected} />}
      {section === 'houses' && <HouseTable chart={chart} />}
      {section === 'aspects' && (
        <>
          <Card>
            <T variant="label">Açı matrisi</T>
            <AspectGrid chart={chart} />
          </Card>
          <AspectList aspects={chart.aspects} />
        </>
      )}
      {section === 'balance' && (
        <>
          <BalanceBars elements={chart.elements} modalities={chart.modalities} />
          <Card>
            <T variant="label">Teknik</T>
            <T variant="small">UTC: {chart.meta.utc.toISOString().replace('T', ' ').slice(0, 16)}</T>
            <T variant="small">Jülyen günü: {chart.meta.jd.toFixed(5)}</T>
            <T variant="small">Yıldız zamanı (RAMC): {chart.meta.ramc.toFixed(3)}°</T>
            <T variant="small">Ekliptik eğikliği: {chart.meta.obliquity.toFixed(4)}°</T>
            <T variant="small">Düğüm: {chart.options.nodeType === 'true' ? 'Gerçek' : 'Ortalama'}</T>
          </Card>
        </>
      )}
    </>
  );
}

const styleSets = forEachScheme((c) =>
  StyleSheet.create({
    sky: {
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: c.sky,
      borderRadius: Radius.xl,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.two,
    },
  }),
);
