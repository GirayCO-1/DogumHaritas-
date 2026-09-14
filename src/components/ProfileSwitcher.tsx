import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { formatLocal } from '@/astro/time';
import type { NatalChart } from '@/astro/types';
import { Spacing, useColors } from '@/constants/theme';
import { useAppStore, type Profile } from '@/store/useAppStore';

import { Chip, Row, T } from './ui';

/** Yatay profil seçici çipleri */
export function ProfileChips({
  selectedId,
  onSelect,
  exclude,
}: {
  selectedId: string | null | undefined;
  onSelect: (id: string) => void;
  exclude?: string | null;
}) {
  const profiles = useAppStore((s) => s.profiles);
  const Colors = useColors();
  const router = useRouter();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingVertical: 2 }}>
      {profiles
        .filter((p) => p.id !== exclude)
        .map((p) => (
          <Chip key={p.id} label={p.name} active={p.id === selectedId} onPress={() => onSelect(p.id)} icon={p.isSelf ? 'person' : undefined} />
        ))}
      <Chip label="Yeni" icon="add" onPress={() => router.push({ pathname: '/profile/[id]', params: { id: 'new' } })} color={Colors.accent} />
    </ScrollView>
  );
}

/** Profil adı, tarih ve yer bilgisi başlığı */
export function ProfileHeader({ profile, chart, onEdit }: { profile: Profile; chart: NatalChart | null; onEdit?: () => void }) {
  const Colors = useColors();
  const dateText = chart ? formatLocal(chart.meta.utc, chart.meta.timeZone, !profile.timeUnknown) : `${profile.day}.${profile.month}.${profile.year}`;
  return (
    <Row style={{ alignItems: 'flex-start' }}>
      <View style={{ flex: 1 }}>
        <T variant="title">{profile.name}</T>
        <T variant="small">
          {dateText}
          {profile.timeUnknown ? ' (saat bilinmiyor)' : ''}
        </T>
        <T variant="small">{profile.placeName}</T>
      </View>
      {onEdit && (
        <Pressable onPress={onEdit} hitSlop={10} style={{ padding: 6 }} accessibilityLabel="Profili düzenle">
          <Ionicons name="create-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      )}
    </Row>
  );
}
