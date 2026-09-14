import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing, forEachScheme, useColors, useScheme } from '@/constants/theme';
import { cityLabel, popularCities, searchCities, type City } from '@/data/cities';
import { useT } from '@/i18n';

import { ListRow, T } from './ui';

export function CityPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
}) {
  const t = useT();
  const styles = stylesSets[useScheme()];
  const Colors = useColors();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  const results = useMemo(() => (debounced.trim().length >= 2 ? searchCities(debounced) : popularCities()), [debounced]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} presentationStyle="pageSheet">
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <T variant="heading">{t.city.title}</T>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel={t.common.close}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t.city.search}
              placeholderTextColor={Colors.muted}
              style={styles.input}
              autoFocus
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.muted} />
              </Pressable>
            )}
          </View>
          {debounced.trim().length < 2 && <T variant="label" style={{ marginBottom: 4 }}>{t.city.popular}</T>}
          <FlatList
            data={results}
            keyExtractor={(c) => `${c.name}-${c.lat}-${c.lng}`}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <ListRow
                title={item.name}
                subtitle={`${item.admin && item.admin !== item.name ? `${item.admin}, ` : ''}${item.countryName} · ${item.timeZone}`}
                left={<Ionicons name="location-outline" size={18} color={Colors.primary} />}
                onPress={() => {
                  onSelect(item);
                  close();
                }}
              />
            )}
            ListEmptyComponent={
              <View style={{ padding: Spacing.four, alignItems: 'center' }}>
                <T variant="small">{t.city.noResults}</T>
              </View>
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export { cityLabel };

const stylesSets = forEachScheme((c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  inner: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three, gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.two },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.cardStrong,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 12,
    height: 46,
  },
  input: { flex: 1, color: c.text, fontSize: 15 },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
}));
