import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontFamily, TabBarBaseHeight, useColors } from '@/constants/theme';

export default function TabsLayout() {
  const Colors = useColors();
  // Android kenardan kenara çizer: sekme çubuğu sistem gezinme çubuğunun
  // altında kalmasın diye alt güvenli alan payı eklenir.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopWidth: 0,
          height: TabBarBaseHeight + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          // Çubuk zeminden gölgeyle ayrılır; ince çizgi kullanılmaz.
          ...(Colors.scheme === 'light'
            ? { shadowColor: Colors.shadow, shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -2 }, elevation: 12 }
            : {}),
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: FontFamily.sansSemiBold, marginTop: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="transits"
        options={{
          title: 'Gökyüzü',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'sunny' : 'sunny-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="synastry"
        options={{
          title: 'Uyum',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profiles"
        options={{
          title: 'Kişiler',
          tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
