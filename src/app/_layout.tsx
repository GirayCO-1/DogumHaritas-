import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';

import { FontFamily, useColors } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const Colors = useColors();
  const hydrated = useAppStore((s) => s.hydrated);
  /**
   * Yazı tipleri yüklenmeden ağaç çizilmemeli. Android her Text'i bir kez
   * ölçüyor: özel yazı tipi henüz kayıtlı değilse yedek yazı tipinin
   * ölçüsüyle hizalıyor, sonra daha geniş glifleri çiziyor ama yeniden
   * hizalamıyor — tek satırlık yazıların sonu kırpılıyor ("Bugü", "Kozmik").
   * Hata olursa da devam edilir; o durumda sistem yazı tipiyle çizilir.
   */
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const navTheme = useMemo(() => {
    const base = Colors.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: Colors.primary,
        background: Colors.background,
        card: Colors.background,
        text: Colors.text,
        border: Colors.border,
        notification: Colors.accent,
      },
    };
  }, [Colors]);

  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (hydrated && fontsReady) SplashScreen.hideAsync().catch(() => {});
  }, [hydrated, fontsReady]);

  // Depolama ya da yazı tipi okunamazsa bile açılış ekranında takılı kalma
  useEffect(() => {
    const id = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 3000);
    return () => clearTimeout(id);
  }, []);

  // Açılış ekranı görünmeye devam eder
  if (!fontsReady) return null;

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={Colors.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: fontsLoaded ? { fontFamily: FontFamily.display, fontSize: 18 } : { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/[id]" options={{ title: 'Kişi', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'Ayarlar' }} />
        <Stack.Screen name="interpret" options={{ title: 'Yorum' }} />
      </Stack>
    </ThemeProvider>
  );
}
