/**
 * Doğum haritasının gövdesi: çark + üç temel + element dengesi +
 * "Haritanın detayları" bölümü.
 *
 * Hem Harita sekmesinde hem de Anasayfa'nın "Haritam" bölümünde
 * kullanılır; iki yerde aynı içerik iki kez yazılmasın diye ayrıldı.
 */
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import type { BodyId, NatalChart } from '@/astro/types';
import { MaxContentWidth, Radius, Spacing, forEachScheme, useColors, useScheme } from '@/constants/theme';
import { useAstro, useT, type Messages } from '@/i18n';
import type { Profile } from '@/store/useAppStore';

import { ChartWheel } from './ChartWheel';
import { AspectGrid, AspectList, BalanceBars, BigThree, BodyDetail, ElementStrip, HouseTable, PlanetTable } from './ChartTables';
import { Card, Chip, Row, T } from './ui';

type Section = 'planets' | 'houses' | 'aspects' | 'balance';

function sections(t: Messages): [Section, string][] {
  return [
    ['planets', t.chart.planets],
    ['houses', t.chart.houses],
    ['aspects', t.chart.aspects],
    ['balance', t.chart.balance],
  ];
}

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
  const t = useT();
  const astro = useAstro();
  const s = styleSets[useScheme()];
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
          <Chip label={t.chart.aspects} icon="git-network-outline" active={showAspects} onPress={() => setShowAspects((v) => !v)} />
          {/* Bilgi etiketi, kısayol değil: ev sistemi Ayarlar'dan değişir */}
          <Chip label={astro.houseSystems[chart.houses.system]} icon="grid-outline" />
          {chart.houses.fallbackFrom && <Chip label={t.chart.polarFallback} color={Colors.warning} active />}
          {profile.timeUnknown && <Chip label={t.chart.timeUnknown} color={Colors.warning} active />}
        </Row>
      </View>

      {selected && <BodyDetail chart={chart} id={selected} />}

      <View style={{ gap: Spacing.two }}>
        <T variant="label">{t.chart.threeBasics}</T>
        <BigThree chart={chart} />
      </View>

      <ElementStrip elements={chart.elements} />

      <View style={{ gap: Spacing.two }}>
        <T variant="label">{t.chart.details}</T>
        <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
          {sections(t).map(([k, label]) => (
            <Chip key={k} label={label} active={section === k} onPress={() => setSection(k)} />
          ))}
        </Row>
      </View>

      {section === 'planets' && <PlanetTable chart={chart} selected={selected} onSelect={setSelected} />}
      {section === 'houses' && <HouseTable chart={chart} />}
      {section === 'aspects' && (
        <>
          <Card>
            <T variant="label">{t.chart.aspectMatrix}</T>
            <AspectGrid chart={chart} />
          </Card>
          <AspectList aspects={chart.aspects} />
        </>
      )}
      {section === 'balance' && (
        <>
          <BalanceBars elements={chart.elements} modalities={chart.modalities} />
          <Card>
            <T variant="label">{t.chart.technical}</T>
            <T variant="small">UTC: {chart.meta.utc.toISOString().replace('T', ' ').slice(0, 16)}</T>
            <T variant="small">Jülyen günü: {chart.meta.jd.toFixed(5)}</T>
            <T variant="small">Yıldız zamanı (RAMC): {chart.meta.ramc.toFixed(3)}°</T>
            <T variant="small">Ekliptik eğikliği: {chart.meta.obliquity.toFixed(4)}°</T>
            <T variant="small">Düğüm: {chart.options.nodeType === 'true' ? t.chart.nodeTrue : t.chart.nodeMean}</T>
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
