import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { THEMES, THEME_ORDER, type InterpretationTheme } from '@/ai/prompts';
import { HOUSE_SYSTEM_NAMES } from '@/astro/constants';
import { formatLocal } from '@/astro/time';
import type { BodyId } from '@/astro/types';
import { ChartWheel } from '@/components/ChartWheel';
import { AspectGrid, AspectList, BalanceBars, BigThree, BodyDetail, ElementStrip, HouseTable, PlanetTable } from '@/components/ChartTables';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { MaxContentWidth, Radius, Spacing, forEachScheme, shadow, useColors, useScheme } from '@/constants/theme';
import { useNatalChart } from '@/hooks/useChart';
import { useActiveProfile, useAppStore } from '@/store/useAppStore';

type Section = 'planets' | 'houses' | 'aspects' | 'balance';

const SECTIONS: [Section, string][] = [
  ['planets', 'Gezegenler'],
  ['houses', 'Evler'],
  ['aspects', 'Açılar'],
  ['balance', 'Denge'],
];

export default function ChartScreen() {
  const Colors = useColors();
  const s = styleSets[useScheme()];
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profile = useActiveProfile();
  const setActive = useAppStore((st) => st.setActiveProfile);
  const hydrated = useAppStore((st) => st.hydrated);
  const showMinor = useAppStore((st) => st.settings.showMinorAspects);
  const chart = useNatalChart(profile);
  const [selected, setSelected] = useState<BodyId | null>(null);
  const [section, setSection] = useState<Section>('planets');
  const [theme, setTheme] = useState<InterpretationTheme>('general');
  const [showAspects, setShowAspects] = useState(true);

  if (!hydrated) return <Screen scroll={false}>{null}</Screen>;

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          icon="planet-outline"
          title="Doğum haritanı oluştur"
          text="Doğum tarihi, saati ve yerini gir; gezegen konumları, evler ve açılar saniyeler içinde hesaplansın."
          action={<Button title="Harita Oluştur" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      </Screen>
    );
  }

  // Çark, gökyüzü kartının iç boşluğu çıkarıldıktan sonra kalan genişliği alır
  const wheelSize = Math.min(width - Spacing.three * 2 - Spacing.two * 2, MaxContentWidth - Spacing.three * 2, 460);
  const birthLine = chart ? formatLocal(chart.meta.utc, chart.meta.timeZone, !profile.timeUnknown) : `${profile.day}.${profile.month}.${profile.year}`;

  return (
    <Screen contentStyle={{ gap: Spacing.four }}>
      {/* Karşılama */}
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="display">Merhaba, {profile.name.split(' ')[0]}</T>
          <T variant="small">
            {birthLine} · {profile.placeName}
          </T>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={10}
          style={s.iconBtn}
          accessibilityLabel="Ayarlar">
          <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </Row>

      <ProfileChips selectedId={profile.id} onSelect={setActive} />

      {!chart ? (
        <Card>
          <T color={Colors.danger}>Harita hesaplanamadı. Profil bilgilerini kontrol et.</T>
        </Card>
      ) : (
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
      )}
    </Screen>
  );
}

const styleSets = forEachScheme((c) =>
  StyleSheet.create({
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
      ...(c.scheme === 'light' ? shadow(c, 1) : { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }),
    },
    sky: {
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: c.sky,
      borderRadius: Radius.xl,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.two,
    },
    // Davet kartının zemini zaten tonlu; etkin olmayan çipler beyaz kalsın
    themeChip: { backgroundColor: c.card },
  }),
);
