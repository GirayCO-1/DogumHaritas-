import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { BirthInput, HouseSystem, NodeType } from '@/astro/types';

/** Kayıtlı kişi profili (cihazda saklanır) */
export interface Profile {
  id: string;
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timeUnknown: boolean;
  timeZone: string;
  lat: number;
  lng: number;
  placeName: string;
  countryCode?: string;
  /** Kendi profilim (varsayılan seçili) */
  isSelf?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type AiMode = 'off' | 'direct' | 'proxy';
export type AiEffort = 'low' | 'medium' | 'high';

export interface Settings {
  houseSystem: HouseSystem;
  nodeType: NodeType;
  /** Küçük açıları (30°, 45°, 72°, 135°, 144°) göster */
  showMinorAspects: boolean;
  aiMode: AiMode;
  /** Sunucu vekili kullanılıyorsa uç nokta (örn. https://.../interpret) */
  aiProxyUrl: string;
  /** Vekilin beklediği paylaşımlı sır (X-App-Token), isteğe bağlı */
  aiProxyToken: string;
  aiEffort: AiEffort;
}

export interface InterpretationEntry {
  text: string;
  createdAt: number;
  model: string;
}

interface AppState {
  profiles: Profile[];
  activeProfileId: string | null;
  settings: Settings;
  /** key: `${kind}:${profileId}[:${otherId}]:${hash}` */
  interpretations: Record<string, InterpretationEntry>;
  hydrated: boolean;

  addProfile: (p: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>) => Profile;
  updateProfile: (id: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setInterpretation: (key: string, entry: InterpretationEntry) => void;
  clearInterpretations: () => void;
  setHydrated: (v: boolean) => void;
}

/**
 * Derleme zamanında gömülen vekil adresi (.env → EXPO_PUBLIC_AI_PROXY_URL).
 *
 * Doluysa uygulama kutudan çıktığı gibi yapay zekâ yorumu verir: istek
 * senin Cloudflare Worker'ına gider, Anthropic anahtarı orada durur.
 * ANAHTARIN KENDİSİ ASLA BURAYA YAZILMAZ — EXPO_PUBLIC_ değişkenleri JS
 * paketine gömülür ve APK'dan okunabilir.
 */
export const BUILD_PROXY_URL = (process.env.EXPO_PUBLIC_AI_PROXY_URL ?? '').trim();
export const BUILD_PROXY_TOKEN = (process.env.EXPO_PUBLIC_AI_PROXY_TOKEN ?? '').trim();

export const DEFAULT_SETTINGS: Settings = {
  houseSystem: 'placidus',
  nodeType: 'true',
  showMinorAspects: false,
  // Vekil tanımlıysa yapay zekâ açık gelir, değilse kullanıcı kendi anahtarını girer
  aiMode: BUILD_PROXY_URL ? 'proxy' : 'off',
  aiProxyUrl: BUILD_PROXY_URL,
  aiProxyToken: BUILD_PROXY_TOKEN,
  aiEffort: 'medium',
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      settings: DEFAULT_SETTINGS,
      interpretations: {},
      hydrated: false,

      addProfile: (p) => {
        const now = Date.now();
        const profile: Profile = { ...p, id: makeId(), createdAt: now, updatedAt: now };
        set((s) => ({
          profiles: [...s.profiles, profile],
          activeProfileId: s.activeProfileId ?? profile.id,
        }));
        return profile;
      },

      updateProfile: (id, patch) =>
        set((s) => ({
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
          // Profil değişince eski yorumlar geçersiz
          interpretations: Object.fromEntries(
            Object.entries(s.interpretations).filter(([k]) => !k.includes(`:${id}`)),
          ),
        })),

      removeProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((p) => p.id !== id);
          return {
            profiles,
            activeProfileId: s.activeProfileId === id ? (profiles[0]?.id ?? null) : s.activeProfileId,
            interpretations: Object.fromEntries(
              Object.entries(s.interpretations).filter(([k]) => !k.includes(`:${id}`)),
            ),
          };
        }),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      updateSettings: (patch) =>
        set((s) => {
          const settings = { ...s.settings, ...patch };
          // Ev sistemi / düğüm tipi değişince yorumlar da değişir
          const invalidates = patch.houseSystem !== undefined || patch.nodeType !== undefined;
          return { settings, interpretations: invalidates ? {} : s.interpretations };
        }),

      setInterpretation: (key, entry) =>
        set((s) => ({ interpretations: { ...s.interpretations, [key]: entry } })),

      clearInterpretations: () => set({ interpretations: {} }),

      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: 'dogum-haritasi-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        settings: s.settings,
        interpretations: s.interpretations,
      }),
      // Eski sürümden gelen kayıtlarda yeni ayar alanları eksik olabilir
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>;
        const settings: Settings = { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) };
        // Vekil adresi uygulamayla gelir: yeni sürümde değişmişse güncellenir.
        // Kullanıcı kendi anahtarını seçtiyse (direct) tercihine dokunulmaz.
        if (BUILD_PROXY_URL && settings.aiMode !== 'direct') {
          settings.aiProxyUrl = BUILD_PROXY_URL;
          settings.aiProxyToken = BUILD_PROXY_TOKEN;
          if (settings.aiMode === 'off') settings.aiMode = 'proxy';
        }
        return { ...current, ...p, settings };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

/** Profil → hesap motoru girdisi */
export function profileToBirthInput(p: Profile): BirthInput {
  return {
    name: p.name,
    year: p.year,
    month: p.month,
    day: p.day,
    hour: p.hour,
    minute: p.minute,
    timeUnknown: p.timeUnknown,
    timeZone: p.timeZone,
    location: { lat: p.lat, lng: p.lng },
    placeName: p.placeName,
  };
}

export function useActiveProfile(): Profile | undefined {
  return useAppStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]);
}
