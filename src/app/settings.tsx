import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Switch, TextInput, View } from 'react-native';

import { AI_MODEL } from '@/ai/claude';
import { getApiKey, maskKey, setApiKey } from '@/ai/secure';
import type { HouseSystem, NodeType } from '@/astro/types';
import { Button, Card, Chip, Divider, Row, Screen, T } from '@/components/ui';
import { Radius, forEachScheme, useColors, useScheme, type Appearance } from '@/constants/theme';
import { cityCount } from '@/data/cities';
import { LOCALES, LOCALE_ORDER, useAstro, useRtl, useT, type LanguageSetting } from '@/i18n';
import { BUILD_PROXY_URL, useAppStore, type AiEffort, type AiMode } from '@/store/useAppStore';

const HOUSE_SYSTEMS: HouseSystem[] = ['placidus', 'koch', 'whole', 'equal', 'porphyry', 'campanus', 'regiomontanus'];

const APPEARANCE_ICONS: Record<Appearance, string> = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  system: 'phone-portrait-outline',
};
const APPEARANCE_ORDER: readonly Appearance[] = ['light', 'dark', 'system'];

/** Ayarda dil listesi: önce "cihaz dili", sonra desteklenen diller */
const LANGUAGE_ORDER: readonly LanguageSetting[] = ['system', ...LOCALE_ORDER];

export default function SettingsScreen() {
  const styles = stylesSets[useScheme()];
  const Colors = useColors();
  const t = useT();
  const astro = useAstro();
  const rtl = useRtl();
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
      <T variant="heading">{t.settings.appearance}</T>
      <Card>
        <T variant="label">{t.settings.theme}</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {APPEARANCE_ORDER.map((k) => (
            <Chip
              key={k}
              label={k === 'light' ? t.settings.light : k === 'dark' ? t.settings.dark : t.settings.system}
              icon={APPEARANCE_ICONS[k] as never}
              active={settings.appearance === k}
              onPress={() => update({ appearance: k })}
            />
          ))}
        </Row>
        <T variant="small">{t.settings.themeNote}</T>
        <Divider />
        <T variant="label">{t.settings.language}</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {LANGUAGE_ORDER.map((k) => (
            <Chip
              key={k}
              label={k === 'system' ? t.settings.languageSystem : LOCALES[k].name}
              active={settings.language === k}
              onPress={() => update({ language: k })}
            />
          ))}
        </Row>
        <T variant="small">{t.settings.languageNote}</T>
        {/* Sağdan sola yerleşim yalnızca açılışta kurulur */}
        {rtl && (
          <T variant="small" color={Colors.warning}>
            {t.settings.rtlRestart}
          </T>
        )}
      </Card>

      <T variant="heading">{t.settings.calculation}</T>
      <Card>
        <T variant="label">{t.settings.houseSystem}</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {HOUSE_SYSTEMS.map((h) => (
            <Chip key={h} label={astro.houseSystems[h]} active={settings.houseSystem === h} onPress={() => update({ houseSystem: h })} />
          ))}
        </Row>
        <T variant="small">{t.settings.houseSystemNote}</T>
        <Divider />
        <T variant="label">{t.settings.lunarNode}</T>
        <Row gap={8}>
          {(
            [
              ['true', t.settings.nodeTrue],
              ['mean', t.settings.nodeMean],
            ] as [NodeType, string][]
          ).map(([k, label]) => (
            <Chip key={k} label={label} active={settings.nodeType === k} onPress={() => update({ nodeType: k })} />
          ))}
        </Row>
        <Divider />
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T variant="subheading">{t.settings.minorAspects}</T>
            <T variant="small">{t.settings.minorAspectsNote}</T>
          </View>
          <Switch value={settings.showMinorAspects} onValueChange={(v) => update({ showMinorAspects: v })} trackColor={{ true: Colors.primary, false: Colors.cardStrong }} thumbColor="#fff" />
        </Row>
      </Card>

      <T variant="heading">{t.settings.ai}</T>
      <Card>
        <T variant="small">{t.settings.aiNote(AI_MODEL)}</T>
        <Row gap={8} style={{ flexWrap: 'wrap' }}>
          {(
            [
              ['off', t.settings.aiOff],
              ['direct', t.settings.aiOwnKey],
              ['proxy', t.settings.aiProxy],
            ] as [AiMode, string][]
          ).map(([k, label]) => (
            <Chip key={k} label={label} active={settings.aiMode === k} onPress={() => update({ aiMode: k })} />
          ))}
        </Row>

        {settings.aiMode === 'direct' && (
          <View style={{ gap: 8 }}>
            <T variant="label">{t.settings.apiKey}</T>
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
              placeholder={storedKey ? '{t.settings.replaceKey}' : 'sk-ant-…'}
              placeholderTextColor={Colors.muted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Row gap={8}>
              <Button title={keySaved ? t.settings.savedTick : t.settings.saveKey} small onPress={saveKey} disabled={!keyInput.trim()} />
              {storedKey && (
                <Button
                  title={t.settings.deleteKey}
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

        {settings.aiMode === 'proxy' && BUILD_PROXY_URL ? (
          <View style={{ gap: 8 }}>
            <Row gap={6}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
              <T variant="subheading">{t.settings.usingAppServer}</T>
            </Row>
            <T variant="small">
              Yorumlar uygulamanın kendi sunucusu üzerinden üretilir; senin bir API anahtarı girmene gerek yok.
            </T>
            <T variant="caption">{BUILD_PROXY_URL}</T>
          </View>
        ) : null}

        {settings.aiMode === 'proxy' && !BUILD_PROXY_URL && (
          <View style={{ gap: 8 }}>
            <T variant="label">{t.settings.proxyUrl}</T>
            <T variant="small">{t.settings.proxyNote}</T>
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
            <T variant="label">{t.settings.appToken}</T>
            <TextInput
              value={settings.aiProxyToken}
              onChangeText={(v) => update({ aiProxyToken: v })}
              placeholder="{t.settings.appTokenNote}"
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
            <T variant="label">{t.settings.depth}</T>
            <Row gap={8}>
              {(
                [
                  ['low', t.settings.fast],
                  ['medium', t.settings.balanced],
                  ['high', t.settings.deep],
                ] as [AiEffort, string][]
              ).map(([k, label]) => (
                <Chip key={k} label={label} active={settings.aiEffort === k} onPress={() => update({ aiEffort: k })} />
              ))}
            </Row>
            <T variant="small">{t.settings.depthNote}</T>
          </>
        )}

        {cacheCount > 0 && (
          <>
            <Divider />
            <Row style={{ justifyContent: 'space-between' }}>
              <T variant="small">{cacheCount} kayıtlı yorum</T>
              <Button title={t.settings.clearCache} small variant="ghost" onPress={clearInterpretations} />
            </Row>
          </>
        )}
      </Card>

      <T variant="heading">{t.settings.about}</T>
      <Card>
        <T variant="small">Doğum Haritası v{Constants.expoConfig?.version ?? '1.0.0'}</T>
        <T variant="small">Gezegen konumları: astronomy-engine (VSOP87 tabanlı, ±1′). Chiron: Moshier efemerisi. Şehir veritabanı: GeoNames ({cityCount().toLocaleString('tr-TR')} yerleşim). Saat dilimleri: IANA tz.</T>
        <T variant="small">{t.settings.aboutNote}</T>
      </Card>
    </Screen>
  );
}

const stylesSets = forEachScheme((c) => StyleSheet.create({
  input: {
    backgroundColor: c.cardStrong,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: Radius.md,
    color: c.text,
    fontSize: 15,
    paddingHorizontal: 14,
    height: 46,
  },
}));
