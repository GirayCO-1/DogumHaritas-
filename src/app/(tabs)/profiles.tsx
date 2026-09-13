import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, View } from 'react-native';

import { computeNatalChart } from '@/astro/chart';
import { SignGlyph } from '@/components/Glyph';
import { Badge, Button, Card, EmptyState, ListRow, Row, Screen, T } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { profileToBirthInput, useAppStore, type Profile } from '@/store/useAppStore';

function sunSignOf(p: Profile): number | null {
  try {
    return computeNatalChart(profileToBirthInput(p), { houseSystem: 'whole', aspectTypes: [] }).summary.sunSign;
  } catch {
    return null;
  }
}

function confirmDelete(name: string, onOk: () => void) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(`${name} profilini silmek istediğine emin misin?`)) onOk();
    return;
  }
  Alert.alert('Profili sil', `${name} profilini silmek istediğine emin misin?`, [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: onOk },
  ]);
}

export default function ProfilesScreen() {
  const router = useRouter();
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const setActive = useAppStore((s) => s.setActiveProfile);
  const removeProfile = useAppStore((s) => s.removeProfile);
  const hydrated = useAppStore((s) => s.hydrated);

  if (!hydrated) return <Screen scroll={false}>{null}</Screen>;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="title">Profiller</T>
        <Pressable onPress={() => router.push('/settings')} hitSlop={10} accessibilityLabel="Ayarlar">
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      </Row>

      {profiles.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Henüz profil yok"
          text="Kendin, sevdiklerin ve merak ettiklerin için ayrı profiller oluşturabilirsin."
          action={<Button title="Profil Oluştur" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />}
        />
      ) : (
        <>
          <Card style={{ padding: 4, gap: 0 }}>
            {profiles.map((p) => {
              const sun = sunSignOf(p);
              const isActive = p.id === activeId;
              return (
                <ListRow
                  key={p.id}
                  title={
                    <Row gap={8}>
                      <T variant="subheading">{p.name}</T>
                      {p.isSelf && <Badge label="Ben" color={Colors.primary} />}
                      {isActive && <Badge label="Seçili" color={Colors.accent} />}
                    </Row>
                  }
                  subtitle={`${String(p.day).padStart(2, '0')}.${String(p.month).padStart(2, '0')}.${p.year}${p.timeUnknown ? '' : ` ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`} · ${p.placeName}`}
                  left={sun !== null ? <SignGlyph sign={sun} size={22} /> : <Ionicons name="person" size={18} color={Colors.muted} />}
                  right={
                    <Row gap={2}>
                      <Pressable onPress={() => router.push({ pathname: '/profile/[id]', params: { id: p.id } })} hitSlop={8} style={{ padding: 8 }} accessibilityLabel="Düzenle">
                        <Ionicons name="create-outline" size={20} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable onPress={() => confirmDelete(p.name, () => removeProfile(p.id))} hitSlop={8} style={{ padding: 8 }} accessibilityLabel="Sil">
                        <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                      </Pressable>
                    </Row>
                  }
                  onPress={() => {
                    setActive(p.id);
                    router.navigate('/');
                  }}
                />
              );
            })}
          </Card>
          <T variant="caption" style={{ textAlign: 'center' }}>
            {profiles.length} profil · Veriler yalnızca bu cihazda saklanır
          </T>
          <Button title="Yeni Profil" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} />
        </>
      )}
      <View style={{ height: 24 }} />
    </Screen>
  );
}
