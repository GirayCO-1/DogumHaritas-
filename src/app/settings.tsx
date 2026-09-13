import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AI_MODEL } from '@/ai/claude';
import { getApiKey, maskKey, setApiKey } from '@/ai/secure';
import { HOUSE_SYSTEM_NAMES } from '@/astro/constants';
import type { HouseSystem, NodeType } from '@/astro/types';
import { Button, Card, Chip, Divider, Row, Screen, T } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import { cityCount } from '@/data/cities';
import { useAppStore, type AiEffort, type AiMode } from '@/store/useAppStore';

const HOUSE_SYSTEMS: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry', 'campanus', 'regiomontanus'];

export default function SettingsScreen() {
  const settings = useAppStore((s) => s.settings);
  const update = useAppStore((s) => s.updateSettings);
  const clearInterpretations = useAppStore((s) => s.clearInterpretations);
  const cacheCount = useAppStore((s) => Object.keys(s.interpretations).length);

  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    getApiKey().then(setStoredKey);
  }, []);

  const saveKey = async () => {
    await setApiKey(keyInput);
    setStoredKey(keyInput.trim() || null);
    setKeyInput('');
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <Screen edges={['bottom']}>
      <T variant="heading">Hesaplama</T>
      <Card>
        <T variant="label">Ev Sistemi</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {HOUSE_SYSTEMS.map((h) => (
            <Chip key={h} label={HOUSE_SYSTEM_NAMES[h]} active={settings.houseSystem === h} onPress={() => update({ houseSystem: h })} />
          ))}
        </Row>
        <T variant="small">Placidus, Türkiye’de ve dünyada en yaygın kullanılan sistemdir. Kutup enlemlerinde otomatik olarak Porphyry’ye geçilir.</T>
        <Divider />
        <T variant="label">Ay Düğümü</T>
        <Row gap={8}>
          {(
            [
              ['true', 'Gerçek (True)'],
              ['mean', 'Ortalama (Mean)'],
            ] as [NodeType, string][]
          ).map(([k, label]) => (
            <Chip key={k} label={label} active={settings.nodeType === k} onPress={() => update({ nodeType: k })} />
          ))}
        </Row>
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T variant="subheading">Küçük açılar</T>
            <T variant="small">30°, 45°, 72°, 135°, 144° açılarını da hesapla</T>
          </View>
          <Switch value={settings.showMinorAspects} onValueChange={(v) => update({ showMinorAspects: v })} trackColor={{ true: Colors.primary, false: Colors.cardStrong }} thumbColor="#fff" />
        </Row>
      </Card>

      <T variant="heading">Yapay Zekâ Yorumu</T>
      <Card>
        <T variant="small">
          Yorumlar Anthropic’in Claude modeli ({AI_MODEL}) ile üretilir. Harita verisi (gezegen konumları, evler, açılar) ve profildeki isim gönderilir; başka hiçbir veri paylaşılmaz.
        </T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {(
            [
              ['off', 'Kapalı'],
              ['direct', 'Kendi API anahtarım'],
              ['proxy', 'Sunucu vekili'],
            ] as [AiMode, string][]
          ).map(([k, label]) => (
            <Chip key={k} label={label} active={settings.aiMode === k} onPress={() => update({ aiMode: k })} />
          ))}
        </Row>

        {settings.aiMode === 'direct' && (
          <View style={{ gap: 8 }}>
            <T variant="label">Anthropic API Anahtarı</T>
            <T variant="small">
              Anahtar cihazda güvenli alanda (Keychain / Keystore) saklanır, yalnızca api.anthropic.com’a gönderilir.{' '}
              <T variant="small" color={Colors.primary} onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}>
                Anahtar al →
              </T>
            </T>
            {storedKey && (
              <Row gap={6}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <T variant="small">Kayıtlı anahtar: {maskKey(storedKey)}</T>
              </Row>
            )}
            <TextInput
              value={keyInput}
              onChangeText={setKeyInput}
              placeholder={storedKey ? 'Yeni anahtar girerek değiştir' : 'sk-ant-…'}
              placeholderTextColor={Colors.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Row gap={8}>
              <Button title={keySaved ? 'Kaydedildi ✓' : 'Anahtarı Kaydet'} small onPress={saveKey} disabled={!keyInput.trim()} />
              {storedKey && (
                <Button
                  title="Anahtarı Sil"
                  small
                  variant="danger"
                  onPress={async () => {
                    await setApiKey('');
                    setStoredKey(null);
                  }}
                />
              )}
            </Row>
          </View>
        )}

        {settings.aiMode === 'proxy' && (
          <View style={{ gap: 8 }}>
            <T variant="label">Vekil Sunucu Adresi</T>
            <T variant="small">Anahtarı sunucuda tutmak için server/ klasöründeki örnek vekili yayınla ve adresini gir (Play Store dağıtımı için önerilen yol).</T>
            <TextInput
              value={settings.aiProxyUrl}
              onChangeText={(v) => update({ aiProxyUrl: v })}
              placeholder="https://ornek.workers.dev/interpret"
              placeholderTextColor={Colors.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <T variant="label">Uygulama Anahtarı (isteğe bağlı)</T>
            <TextInput
              value={settings.aiProxyToken}
              onChangeText={(v) => update({ aiProxyToken: v })}
              placeholder="Vekilde APP_TOKEN tanımlıysa buraya gir"
              placeholderTextColor={Colors.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>
        )}

        {settings.aiMode !== 'off' && (
          <>
            <Divider />
            <T variant="label">Derinlik</T>
            <Row gap={8}>
              {(
                [
                  ['low', 'Hızlı'],
                  ['medium', 'Dengeli'],
                  ['high', 'Derin'],
                ] as [AiEffort, string][]
              ).map(([k, label]) => (
                <Chip key={k} label={label} active={settings.aiEffort === k} onPress={() => update({ aiEffort: k })} />
              ))}
            </Row>
            <T variant="small">Daha derin yorumlar daha uzun sürer ve daha fazla token harcar.</T>
          </>
        )}

        {cacheCount > 0 && (
          <>
            <Divider />
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="small">{cacheCount} kayıtlı yorum</T>
              <Button title="Önbelleği Temizle" small variant="ghost" onPress={clearInterpretations} />
            </Row>
          </>
        )}
      </Card>

      <T variant="heading">Hakkında</T>
      <Card>
        <T variant="small">Doğum Haritası v{Constants.expoConfig?.version ?? '1.0.0'}</T>
        <T variant="small">Gezegen konumları: astronomy-engine (VSOP87 tabanlı, ±1′). Chiron: Moshier efemerisi. Şehir veritabanı: GeoNames ({cityCount().toLocaleString('tr-TR')} yerleşim). Saat dilimleri: IANA tz.</T>
        <T variant="small">Tüm hesaplar cihazda yapılır; profiller yalnızca bu cihazda saklanır.</T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.cardStrong,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    color: Colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    height: 46,
  },
});
