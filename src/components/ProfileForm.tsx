import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import type { City } from '@/data/cities';
import type { Profile } from '@/store/useAppStore';

import { CityPicker } from './CityPicker';
import { Button, Card, Row, T } from './ui';

export type ProfileDraft = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

interface FormState {
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  timeUnknown: boolean;
  isSelf: boolean;
  city: {
    name: string;
    lat: number;
    lng: number;
    timeZone: string;
    countryCode?: string;
    label: string;
  } | null;
}

function fromProfile(p?: Profile | null): FormState {
  if (!p)
    return { name: '', day: '', month: '', year: '', hour: '', minute: '', timeUnknown: false, isSelf: false, city: null };
  return {
    name: p.name,
    day: String(p.day),
    month: String(p.month),
    year: String(p.year),
    hour: String(p.hour).padStart(2, '0'),
    minute: String(p.minute).padStart(2, '0'),
    timeUnknown: p.timeUnknown,
    isSelf: !!p.isSelf,
    city: { name: p.placeName, lat: p.lat, lng: p.lng, timeZone: p.timeZone, countryCode: p.countryCode, label: p.placeName },
  };
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function validate(f: FormState): { errors: string[]; draft?: ProfileDraft } {
  const errors: string[] = [];
  const name = f.name.trim();
  if (!name) errors.push('İsim gerekli.');
  const day = parseInt(f.day, 10);
  const month = parseInt(f.month, 10);
  const year = parseInt(f.year, 10);
  const now = new Date();
  if (!(year >= 1800 && year <= now.getFullYear() + 1)) errors.push('Yıl 1800 ile bugün arasında olmalı.');
  if (!(month >= 1 && month <= 12)) errors.push('Ay 1–12 arasında olmalı.');
  else if (!(day >= 1 && day <= daysInMonth(year || 2000, month))) errors.push('Gün geçersiz.');
  let hour = 12;
  let minute = 0;
  if (!f.timeUnknown) {
    hour = parseInt(f.hour, 10);
    minute = f.minute === '' ? 0 : parseInt(f.minute, 10);
    if (!(hour >= 0 && hour <= 23)) errors.push('Saat 0–23 arasında olmalı.');
    if (!(minute >= 0 && minute <= 59)) errors.push('Dakika 0–59 arasında olmalı.');
  }
  if (!f.city) errors.push('Doğum yeri seçin.');
  if (errors.length || !f.city) return { errors };
  return {
    errors,
    draft: {
      name,
      day,
      month,
      year,
      hour,
      minute,
      timeUnknown: f.timeUnknown,
      timeZone: f.city.timeZone,
      lat: f.city.lat,
      lng: f.city.lng,
      placeName: f.city.label,
      countryCode: f.city.countryCode,
      isSelf: f.isSelf,
    },
  };
}

export function ProfileForm({
  initial,
  onSubmit,
  submitLabel = 'Haritayı Hesapla',
  saving,
}: {
  initial?: Profile | null;
  onSubmit: (draft: ProfileDraft) => void;
  submitLabel?: string;
  saving?: boolean;
}) {
  const [f, setF] = useState<FormState>(() => fromProfile(initial));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  const result = useMemo(() => validate(f), [f]);
  const showErrors = touched && result.errors.length > 0;

  const onCity = (c: City) => {
    const label = [c.name, c.admin && c.admin !== c.name ? c.admin : null, c.countryName].filter(Boolean).join(', ');
    set('city', { name: c.name, lat: c.lat, lng: c.lng, timeZone: c.timeZone, countryCode: c.countryCode, label });
  };

  return (
    <View style={{ gap: Spacing.three }}>
      <Card>
        <T variant="label">İsim</T>
        <TextInput
          value={f.name}
          onChangeText={(v) => set('name', v)}
          placeholder="Örn. Ayşe"
          placeholderTextColor={Colors.muted}
          style={styles.input}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </Card>

      <Card>
        <T variant="label">Doğum Tarihi</T>
        <Row gap={Spacing.two}>
          <Field label="Gün" value={f.day} onChange={(v) => set('day', v)} maxLength={2} placeholder="15" />
          <Field label="Ay" value={f.month} onChange={(v) => set('month', v)} maxLength={2} placeholder="6" />
          <Field label="Yıl" value={f.year} onChange={(v) => set('year', v)} maxLength={4} placeholder="1990" flex={1.4} />
        </Row>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T variant="label">Doğum Saati</T>
          <Row gap={8}>
            <T variant="small">Saati bilmiyorum</T>
            <Switch
              value={f.timeUnknown}
              onValueChange={(v) => set('timeUnknown', v)}
              trackColor={{ true: Colors.primary, false: Colors.cardStrong }}
              thumbColor="#fff"
            />
          </Row>
        </Row>
        {f.timeUnknown ? (
          <T variant="small">
            Öğlen 12:00 varsayılır. Yükselen burç ve ev konumları güvenilmez olur; Güneş, Ay ve gezegen burçları yine hesaplanır.
          </T>
        ) : (
          <Row gap={Spacing.two}>
            <Field label="Saat" value={f.hour} onChange={(v) => set('hour', v)} maxLength={2} placeholder="14" />
            <T variant="heading" style={{ marginTop: 14 }}>
              :
            </T>
            <Field label="Dakika" value={f.minute} onChange={(v) => set('minute', v)} maxLength={2} placeholder="30" />
            <View style={{ flex: 1.2 }} />
          </Row>
        )}
      </Card>

      <Card>
        <T variant="label">Doğum Yeri</T>
        <Pressable onPress={() => setPickerOpen(true)} style={({ pressed }) => [styles.cityBtn, pressed && { opacity: 0.8 }]}>
          <Ionicons name="location" size={18} color={f.city ? Colors.primary : Colors.muted} />
          <View style={{ flex: 1 }}>
            <T color={f.city ? Colors.text : Colors.muted}>{f.city ? f.city.label : 'Şehir / ilçe seçin'}</T>
            {f.city && (
              <T variant="caption">
                {f.city.lat.toFixed(3)}°, {f.city.lng.toFixed(3)}° · {f.city.timeZone}
              </T>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
        </Pressable>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T variant="subheading">Bu benim haritam</T>
            <T variant="small">Transitler ve günlük yorumlar bu profil için gösterilir.</T>
          </View>
          <Switch value={f.isSelf} onValueChange={(v) => set('isSelf', v)} trackColor={{ true: Colors.primary, false: Colors.cardStrong }} thumbColor="#fff" />
        </Row>
      </Card>

      {showErrors && (
        <Card tone="default" style={{ borderColor: 'rgba(240,100,122,0.5)' }}>
          {result.errors.map((e) => (
            <Row key={e} gap={6}>
              <Ionicons name="alert-circle" size={15} color={Colors.danger} />
              <T variant="small" color={Colors.danger}>
                {e}
              </T>
            </Row>
          ))}
        </Card>
      )}

      <Button
        title={submitLabel}
        icon="sparkles"
        loading={saving}
        onPress={() => {
          setTouched(true);
          if (result.draft) onSubmit(result.draft);
        }}
      />

      <CityPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onCity} />
    </View>
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
        style={[styles.input, { textAlign: 'center' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.cardStrong,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.text,
    fontSize: 17,
    paddingHorizontal: 14,
    height: 48,
  },
  cityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardStrong,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
    paddingVertical: 8,
  },
});
