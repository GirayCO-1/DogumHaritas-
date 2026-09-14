import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';

import { THEMES, THEME_ORDER, type InterpretationTheme } from '@/ai/prompts';
import { HOUSE_SYSTEM_NAMES } from '@/astro/constants';
import type { BodyId } from '@/astro/types';
import { ChartWheel } from '@/components/ChartWheel';
import { AspectGrid, AspectList, BalanceBars, BigThree, BodyDetail, ElementStrip, HouseTable, PlanetTable } from '@/components/ChartTables';
import { ProfileChips, ProfileHeader } from '@/components/ProfileSwitcher';
import { Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useNatalChart } from '@/hooks/useChart';
import { useActiveProfile, useAppStore } from '@/store/useAppStore';

type Section = 'planets' | 'houses' | 'aspects' | 'balance';

export default function ChartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const profile = useActiveProfile();
  const setActive = useAppStore((s) => s.setActiveProfile);
  const hydrated = useAppStore((s) => s.hydrated);
  const showMinor = useAppStore((s) => s.settings.showMinorAspects);
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

  const wheelSize = Math.min(width - Spacing.three * 2, MaxContentWidth - Spacing.three * 2, 460);

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="label">Doğum Haritası</T>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityLabel="Ayarlar">
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      </Row>
      <ProfileChips selectedId={profile.id} onSelect={setActive} />
      <ProfileHeader profile={profile} chart={chart} onEdit={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })} />

      {!chart ? (
        <Card>
          <T color={Colors.danger}>Harita hesaplanamadı. Profil bilgilerini kontrol et.</T>
        </Card>
      ) : (
        <>
          <BigThree chart={chart} />
          <ElementStrip elements={chart.elements} />

          <View style={{ alignItems: 'center' }}>
            <ChartWheel chart={chart} size={wheelSize} showAspects={showAspects} showMinor={showMinor} selected={selected} onSelect={setSelected} />
          </View>
          <Row style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip label="Açılar" icon="git-network-outline" active={showAspects} onPress={() => setShowAspects((v) => !v)} />
            <Chip label={HOUSE_SYSTEM_NAMES[chart.houses.system]} icon="grid-outline" onPress={() => router.push('/settings')} />
            {chart.houses.fallbackFrom && <Chip label="Kutup enlemi: Porphyry" color={Colors.warning} active />}
            {profile.timeUnknown && <Chip label="Saat bilinmiyor" color={Colors.warning} active />}
          </Row>

          {selected && <BodyDetail chart={chart} id={selected} />}

          <Card>
            <T variant="label">Yorum Odağı</T>
            <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
              {THEME_ORDER.map((t) => (
                <Chip key={t} label={THEMES[t].name} active={theme === t} onPress={() => setTheme(t)} />
              ))}
            </Row>
            <T variant="small">{THEMES[theme].tagline}</T>
            <Button
              title="Yapay Zekâ ile Yorumla"
              icon="sparkles"
              onPress={() => router.push({ pathname: '/interpret', params: { kind: 'natal', a: profile.id, theme } })}
            />
          </Card>

          <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
            {(
              [
                ['planets', 'Gezegenler'],
                ['houses', 'Evler'],
                ['aspects', 'Açılar'],
                ['balance', 'Denge'],
              ] as [Section, string][]
            ).map(([k, label]) => (
              <Chip key={k} label={label} active={section === k} onPress={() => setSection(k)} />
            ))}
          </Row>

          {section === 'planets' && <PlanetTable chart={chart} selected={selected} onSelect={setSelected} />}
          {section === 'houses' && <HouseTable chart={chart} />}
          {section === 'aspects' && (
            <>
              <Card>
                <T variant="label">Açı Matrisi</T>
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
