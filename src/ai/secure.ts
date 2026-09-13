/**
 * API anahtarı saklama. Cihazda expo-secure-store (Keychain / Keystore),
 * web'de localStorage tabanlı AsyncStorage kullanılır.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'anthropic_api_key';

export async function getApiKey(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') return (await AsyncStorage.getItem(KEY)) || null;
    return (await SecureStore.getItemAsync(KEY)) || null;
  } catch {
    return null;
  }
}

export async function setApiKey(value: string): Promise<void> {
  const v = value.trim();
  if (Platform.OS === 'web') {
    if (v) await AsyncStorage.setItem(KEY, v);
    else await AsyncStorage.removeItem(KEY);
    return;
  }
  if (v) await SecureStore.setItemAsync(KEY, v);
  else await SecureStore.deleteItemAsync(KEY);
}

/** Görüntülemek için maskele: sk-ant-…a1b2 */
export function maskKey(key: string | null): string {
  if (!key) return '';
  if (key.length <= 10) return '•'.repeat(key.length);
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}
