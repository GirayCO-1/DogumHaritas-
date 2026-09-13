import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ------------------------------------------------------------------ */
/* Metin                                                               */
/* ------------------------------------------------------------------ */

type TextVariant = 'body' | 'small' | 'caption' | 'title' | 'heading' | 'subheading' | 'label' | 'mono';

export function T({
  variant = 'body',
  color,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; color?: string }) {
  return <Text style={[text[variant], color ? { color } : null, style]} {...rest} />;
}

const text = StyleSheet.create<Record<TextVariant, TextStyle>>({
  body: { color: Colors.text, fontSize: 15, lineHeight: 22 },
  small: { color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  caption: { color: Colors.muted, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.3 },
  title: { color: Colors.text, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.3 },
  heading: { color: Colors.text, fontSize: 19, lineHeight: 25, fontWeight: '700' },
  subheading: { color: Colors.text, fontSize: 15.5, lineHeight: 21, fontWeight: '600' },
  label: { color: Colors.muted, fontSize: 11, lineHeight: 14, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  mono: { color: Colors.textSecondary, fontSize: 13, fontVariant: ['tabular-nums'] },
});

/* ------------------------------------------------------------------ */
/* Yerleşim                                                            */
/* ------------------------------------------------------------------ */

export function Screen({
  children,
  scroll = true,
  contentStyle,
  edges = ['top'],
  refreshControl,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: ComponentProps<typeof SafeAreaView>['edges'];
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
}) {
  const inner = <View style={[layout.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={layout.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={layout.scroll}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {inner}
        </ScrollView>
      ) : (
        <View style={layout.scroll}>{inner}</View>
      )}
    </SafeAreaView>
  );
}

export function Row({ children, style, gap = Spacing.two, align = 'center', ...rest }: ViewProps & { gap?: number; align?: ViewStyle['alignItems'] }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: align, gap }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Card({
  children,
  style,
  tone = 'default',
  ...rest
}: ViewProps & { tone?: 'default' | 'strong' | 'primary' | 'accent' }) {
  return (
    <View style={[layout.card, layout[`card_${tone}`], style]} {...rest}>
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  subtitle,
  right,
  style,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[layout.sectionTitle, style]}>
      <View style={{ flex: 1 }}>
        <T variant="heading">{title}</T>
        {subtitle ? (
          <T variant="small" style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[layout.divider, style]} />;
}

const layout = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: Spacing.six },
  content: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.three, gap: Spacing.three, paddingTop: Spacing.two },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  card_default: {},
  card_strong: { backgroundColor: Colors.cardStrong, borderColor: Colors.borderStrong },
  card_primary: { backgroundColor: Colors.primarySoft, borderColor: 'rgba(230,184,92,0.35)' },
  card_accent: { backgroundColor: Colors.accentSoft, borderColor: 'rgba(139,124,246,0.4)' },
  sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, marginTop: Spacing.two },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.border, marginVertical: Spacing.one },
});

/* ------------------------------------------------------------------ */
/* Etkileşim                                                           */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const isDisabled = disabled || loading;
  const fg = variant === 'primary' ? '#1A1405' : variant === 'danger' ? Colors.danger : Colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        btn.base,
        btn[variant],
        small && btn.small,
        pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
        isDisabled && { opacity: 0.5 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 15 : 18} color={fg} /> : null}
          <Text style={[btn.text, { color: fg }, small && { fontSize: 13 }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const btn = StyleSheet.create<Record<ButtonVariant | 'base' | 'text' | 'small', ViewStyle & TextStyle>>({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: 13,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  small: { paddingVertical: 8, paddingHorizontal: Spacing.three, borderRadius: Radius.sm },
  text: { fontSize: 15, fontWeight: '700' },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.cardStrong, borderColor: Colors.borderStrong },
  ghost: { backgroundColor: 'transparent', borderColor: Colors.border },
  danger: { backgroundColor: 'rgba(240,100,122,0.12)', borderColor: 'rgba(240,100,122,0.4)' },
});

export function Chip({
  label,
  active,
  onPress,
  color,
  icon,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const tint = color ?? Colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        chip.base,
        active && { backgroundColor: `${tint}26`, borderColor: `${tint}99` },
        pressed && { opacity: 0.7 },
        style,
      ]}>
      {icon ? <Ionicons name={icon} size={13} color={active ? tint : Colors.textSecondary} /> : null}
      <Text style={[chip.text, active && { color: tint }]}>{label}</Text>
    </Pressable>
  );
}

const chip = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  text: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
});

export function ListRow({
  title,
  subtitle,
  left,
  right,
  onPress,
  style,
  ...rest
}: PressableProps & {
  title: ReactNode;
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [row.base, pressed && onPress ? { backgroundColor: Colors.cardStrong } : null, style]}
      {...rest}>
      {left ? <View style={row.left}>{left}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {typeof title === 'string' ? <T variant="subheading">{title}</T> : title}
        {subtitle ? typeof subtitle === 'string' ? <T variant="small">{subtitle}</T> : subtitle : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={Colors.muted} /> : null)}
    </Pressable>
  );
}

const row = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 12,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
  },
  left: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cardStrong },
});

export function EmptyState({
  icon = 'planet-outline',
  title,
  text: body,
  action,
}: {
  icon?: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <View style={empty.base}>
      <View style={empty.iconWrap}>
        <Ionicons name={icon} size={34} color={Colors.primary} />
      </View>
      <T variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {body ? (
        <T variant="small" style={{ textAlign: 'center', maxWidth: 320 }}>
          {body}
        </T>
      ) : null}
      {action ? <View style={{ marginTop: Spacing.two }}>{action}</View> : null}
    </View>
  );
}

const empty = StyleSheet.create({
  base: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six, paddingHorizontal: Spacing.four },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
});

export function Badge({ label, color = Colors.accent }: { label: string; color?: string }) {
  return (
    <View style={{ backgroundColor: `${color}26`, borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

/** Yatay ilerleme çubuğu (0–100) */
export function Bar({ value, color = Colors.primary, height = 8 }: { value: number; color?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: Colors.cardStrong, overflow: 'hidden', flex: 1 }}>
      <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: color, borderRadius: height / 2 }} />
    </View>
  );
}
