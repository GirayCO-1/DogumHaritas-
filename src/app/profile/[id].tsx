import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';

import { ProfileForm, type ProfileDraft } from '@/components/ProfileForm';
import { Screen, T } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

export default function ProfileEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const profiles = useAppStore((s) => s.profiles);
  const addProfile = useAppStore((s) => s.addProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setActive = useAppStore((s) => s.setActiveProfile);

  const isNew = !id || id === 'new';
  const existing = useMemo(() => (isNew ? null : profiles.find((p) => p.id === id) ?? null), [isNew, profiles, id]);

  const onSubmit = (draft: ProfileDraft) => {
    // "Bu benim haritam" tek bir kişide olabilir
    if (draft.isSelf) {
      for (const p of profiles) if (p.isSelf && p.id !== existing?.id) updateProfile(p.id, { isSelf: false });
    }
    if (existing) {
      updateProfile(existing.id, draft);
      setActive(existing.id);
    } else {
      const created = addProfile(draft);
      setActive(created.id);
    }
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ title: isNew ? 'Yeni Kişi' : 'Kişiyi Düzenle' }} />
      <Screen edges={['bottom']}>
        <T variant="small">
          Doğum saati ne kadar kesinse Yükselen burç ve ev yerleşimleri o kadar doğru olur. Saat dilimi ve yaz saati, seçilen yere ve tarihe göre otomatik uygulanır.
        </T>
        <ProfileForm initial={existing} onSubmit={onSubmit} submitLabel={isNew ? 'Haritayı Hesapla' : 'Kaydet'} />
      </Screen>
    </>
  );
}
