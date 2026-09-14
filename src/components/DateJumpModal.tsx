import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaxContentWidth, Radius, Spacing, forEachScheme, useColors, useScheme } from '@/constants/theme';
import { useT } from '@/i18n';

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

/** Ay cinsinden hızlı atlamalar; etiketleri dile göre kurulur */
const PRESET_MONTHS = [1, 3, 6, 12, 36] as const;

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
  const styles = stylesSets[useScheme()];
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
  const t = useT();
  const styles = stylesSets[useScheme()];
  const Colors = useColors();
  const [day, setDay] = useState(() => String(initial.getDate()));
  const [month, setMonth] = useState(() => String(initial.getMonth() + 1));
  const [year, setYear] = useState(() => String(initial.getFullYear()));

  const parsed = useMemo(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!(y >= 1900 && y <= 2099)) return { error: t.date.invalidYear };
    if (!(m >= 1 && m <= 12)) return { error: t.form.invalidMonth };
    if (!(d >= 1 && d <= daysInMonth(y, m))) return { error: t.form.invalidDay };
    return { date: new Date(y, m - 1, d, 12, 0, 0, 0) };
  }, [day, month, year, t]);

  const apply = (date: Date) => {
    onSelect(date);
    onClose();
  };

  return (
    <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="heading">{t.date.title}</T>
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel={t.common.close}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </Pressable>
      </Row>

      <T variant="small">{t.date.hint}</T>

      <Row gap={Spacing.two} align="flex-end">
        <Field label={t.form.day} value={day} onChange={setDay} maxLength={2} placeholder="20" />
        <Field label={t.form.month} value={month} onChange={setMonth} maxLength={2} placeholder="4" />
        <Field label={t.form.year} value={year} onChange={setYear} maxLength={4} placeholder="2028" flex={1.5} />
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
        {t.date.quickJump}
      </T>
      <Row gap={Spacing.two} style={{ flexWrap: 'wrap' }}>
        <Chip label={t.common.today} icon="today-outline" onPress={() => apply(new Date())} />
        {PRESET_MONTHS.map((months) => (
          <Chip
            key={months}
            label={months % 12 === 0 ? t.date.plusYears(months / 12) : t.date.plusMonths(months)}
            onPress={() => apply(addMonths(new Date(), months))}
          />
        ))}
      </Row>

      <Button
        title={t.date.use}
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
  const styles = stylesSets[useScheme()];
  const Colors = useColors();
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

const stylesSets = forEachScheme((c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.background },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  input: {
    backgroundColor: c.cardStrong,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: Radius.md,
    color: c.text,
    fontSize: 17,
    textAlign: 'center',
    height: 48,
  },
}));
