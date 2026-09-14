import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { THEMES, THEME_ORDER, type InterpretationTheme } from '@/ai/prompts';
import { formatLocal } from '@/astro/time';
import { ChartView } from '@/components/ChartView';
import { ProfileChips } from '@/components/ProfileSwitcher';
import { Button, Card, Chip, EmptyState, Row, Screen, T } from '@/components/ui';
import { Spacing, forEachScheme, shadow, useColors, useScheme } from '@/constants/theme';
import { useNatalChart } from '@/hooks/useChart';
import { useActiveProfile, useAppStore } from '@/store/useAppStore';

export default function ChartScreen() {
  const Colors = useColors();
  const s = styleSets[useScheme()];
  const router = useRouter();
  const profile = useActiveProfile();
  const setActive = useAppStore((st) => st.setActiveProfile);
  const hydrated = useAppStore((st) => st.hydrated);
  const showMinor = useAppStore((st) => st.settings.showMinorAspects);
  const chart = useNatalChart(profile);
  const [theme, setTheme] = useState<InterpretationTheme>('general');

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

  const birthLine = chart ? formatLocal(chart.meta.utc, chart.meta.timeZone, !profile.timeUnknown) : `${profile.day}.${profile.month}.${profile.year}`;

  return (
    <Screen contentStyle={{ gap: Spacing.four }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="display">{profile.name}</T>
          <T variant="small">
            {birthLine} · {profile.placeName}
          </T>
        </View>
        <Pressable
          onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
          hitSlop={10}
          style={s.iconBtn}
          accessibilityLabel="Profili düzenle">
          <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
        </Pressable>
      </Row>

      <ProfileChips selectedId={profile.id} onSelect={setActive} />

      {!chart ? (
        <Card>
          <T color={Colors.danger}>Harita hesaplanamadı. Profil bilgilerini kontrol et.</T>
        </Card>
      ) : (
        <>
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
    // Davet kartının zemini zaten tonlu; etkin olmayan çipler beyaz kalsın
    themeChip: { backgroundColor: c.card },
  }),
);
