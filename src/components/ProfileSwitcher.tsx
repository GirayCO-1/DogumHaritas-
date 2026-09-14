import { ScrollView } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

import { Chip } from './ui';

/** Yatay kişi seçici çipleri. Yeni kişi eklemek Kişiler sekmesinden yapılır. */
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
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.two, paddingVertical: 2 }}>
      {profiles
        .filter((p) => p.id !== exclude)
        .map((p) => (
          <Chip key={p.id} label={p.name} active={p.id === selectedId} onPress={() => onSelect(p.id)} icon={p.isSelf ? 'person' : undefined} />
        ))}
    </ScrollView>
  );
}
