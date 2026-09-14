import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

import { Button, Chip, Row, T } from './ui';

/** Ayın gerçek gün sayısı (artık yıl dahil) */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function addMonths(base: Date, months: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth() + months, 1, 12, 0, 0, 0);
  d.setDate(Math.min(base.getDate(), daysInMonth(d.getFullYear(), d.getMonth() + 1)));
  return d;
}

const PRESETS: { label: string; months: number }[] = [
  { label: '+1 ay', months: 1 },
  { label: '+3 ay', months: 3 },
  { label: '+6 ay', months: 6 },
  { label: '+1 yıl', months: 12 },
  { label: '+3 yıl', months: 36 },
];

/**
 * Herhangi bir tarihe atlamak için gün/ay/yıl girişi.
 * Yerel takvim bileşeni yerine sayısal alan kullanılır: her platformda
 * aynı çalışır, uzak yılları (2050) girmek tekerlek çevirmekten kolaydır.
 */
export function DateJumpModal({
  visible,
  value,
  onClose,
  onSelect,
}: {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        {/* Form yalnızca açıkken kurulur: alanlar her açılışta seçili tarihle
            başlar, bunun için efektle durum eşitlemeye gerek kalmaz. */}
        {visible && <DateJumpForm initial={value} onClose={onClose} onSelect={onSelect} />}
      </SafeAreaView>
    </Modal>
  );
}

function DateJumpForm({
  initial,
  onClose,
  onSelect,
}: {
  initial: Date;
  onClose: () => void;
  onSelect: (date: Date) => void;
}) {
  const [day, setDay] = useState(() => String(initial.getDate()));
  const [month, setMonth] = useState(() => String(initial.getMonth() + 1));
  const [year, setYear] = useState(() => String(initial.getFullYear()));

  const parsed = useMemo(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!(y >= 1900 && y <= 2099)) return { error: 'Yıl 1900–2099 arasında olmalı.' };
    if (!(m >= 1 && m <= 12)) return { error: 'Ay 1–12 arasında olmalı.' };
    if (!(d >= 1 && d <= daysInMonth(y, m))) return { error: 'Gün geçersiz.' };
    return { date: new Date(y, m - 1, d, 12, 0, 0, 0) };
  }, [day, month, year]);

  const apply = (date: Date) => {
    onSelect(date);
    onClose();
  };

  return (
    <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="heading">Tarih Seç</T>
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Kapat">
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </Pressable>
      </Row>

      <T variant="small">Geçmiş ya da gelecek herhangi bir tarihi girebilirsin. Gökyüzü o güne göre hesaplanır.</T>

      <Row gap={Spacing.two} align="flex-end">
        <Field label="Gün" value={day} onChange={setDay} maxLength={2} placeholder="20" />
        <Field label="Ay" value={month} onChange={setMonth} maxLength={2} placeholder="4" />
        <Field label="Yıl" value={year} onChange={setYear} maxLength={4} placeholder="2028" flex={1.5} />
      </Row>

      {parsed.error ? (
        <Row gap={6}>
          <Ionicons name="alert-circle" size={15} color={Colors.danger} />
          <T variant="small" color={Colors.danger}>
            {parsed.error}
          </T>
        </Row>
      ) : (
        <T variant="small" color={Colors.primary}>
          {parsed.date!.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </T>
      )}

      <T variant="label" style={{ marginTop: Spacing.two }}>
        Hızlı atla
      </T>
      <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
        <Chip label="Bugün" icon="today-outline" onPress={() => apply(new Date())} />
        {PRESETS.map((p) => (
          <Chip key={p.label} label={p.label} onPress={() => apply(addMonths(new Date(), p.months))} />
        ))}
      </Row>

      <Button
        title="Bu Tarihi Kullan"
        icon="checkmark"
        disabled={!parsed.date}
        onPress={() => parsed.date && apply(parsed.date)}
        style={{ marginTop: Spacing.two }}
      />
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
  placeholder,
  flex = 1,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  placeholder: string;
  flex?: number;
}) {
  return (
    <View style={{ flex, gap: 4 }}>
      <T variant="caption">{label}</T>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  input: {
    backgroundColor: Colors.cardStrong,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.text,
    fontSize: 17,
    textAlign: 'center',
    height: 48,
  },
});
