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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  FontFamily,
  forEachScheme,
  MaxContentWidth,
  Radius,
  Spacing,
  TabBarBaseHeight,
  shadow,
  useColors,
  useScheme,
} from '@/constants/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

/* ------------------------------------------------------------------ */
/* Metin                                                               */
/* ------------------------------------------------------------------ */

/**
 * `display`/`title`/`heading`/`label` serif (Fraunces), gerisi sans.
 * Özel yazı tiplerinde her kalınlık ayrı bir aile olduğu için `fontWeight`
 * ile birleştirilmez.
 */
type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'label'
  | 'subheading'
  | 'body'
  | 'small'
  | 'caption'
  | 'mono';

export function T({
  variant = 'body',
  color,
  style,
  ...rest
}: TextProps & { variant?: TextVariant; color?: string }) {
  const scheme = useScheme();
  return <Text style={[text[scheme][variant], color ? { color } : null, style]} {...rest} />;
}

const text = forEachScheme((c) =>
  StyleSheet.create<Record<TextVariant, TextStyle>>({
    display: { color: c.text, fontFamily: FontFamily.displayBold, fontSize: 30, lineHeight: 38, letterSpacing: -0.4 },
    title: { color: c.text, fontFamily: FontFamily.displayBold, fontSize: 24, lineHeight: 31, letterSpacing: -0.2 },
    heading: { color: c.text, fontFamily: FontFamily.display, fontSize: 19, lineHeight: 26 },
    // Bölüm başlığı. Eskiden büyük harf mikro etiketti; artık serif bir başlık.
    label: { color: c.text, fontFamily: FontFamily.display, fontSize: 17, lineHeight: 24 },
    subheading: { color: c.text, fontFamily: FontFamily.sansSemiBold, fontSize: 15.5, lineHeight: 21 },
    body: { color: c.text, fontFamily: FontFamily.sans, fontSize: 15, lineHeight: 23 },
    small: { color: c.textSecondary, fontFamily: FontFamily.sans, fontSize: 13.5, lineHeight: 20 },
    caption: { color: c.muted, fontFamily: FontFamily.sansMedium, fontSize: 11.5, lineHeight: 15, letterSpacing: 0.2 },
    mono: { color: c.textSecondary, fontFamily: FontFamily.sansMedium, fontSize: 13, fontVariant: ['tabular-nums'] },
  }),
);

/* ------------------------------------------------------------------ */
/* Yerleşim                                                            */
/* ------------------------------------------------------------------ */

type SafeAreaEdges = ComponentProps<typeof SafeAreaView>['edges'];

/** `edges` hem dizi (['top','bottom']) hem nesne ({ bottom: 'maximum' }) olabilir */
function includesBottomEdge(edges: SafeAreaEdges): boolean {
  if (!edges) return false;
  return Array.isArray(edges)
    ? (edges as readonly string[]).includes('bottom')
    : Boolean((edges as Readonly<Record<string, unknown>>).bottom);
}

export function Screen({
  children,
  scroll = true,
  contentStyle,
  edges = ['top'],
  refreshControl,
  underTabBar,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: SafeAreaEdges;
  refreshControl?: ComponentProps<typeof ScrollView>['refreshControl'];
  /**
   * Ekran sekme çubuğunun altında mı kalıyor? Son içerik çubuğun arkasında
   * kaybolmasın diye alt boşluk eklenir. Varsayılan: 'bottom' güvenli alan
   * kenarı verilmediyse evet — sekme ekranları öyle, yığın ekranları değil.
   */
  underTabBar?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const s = layout[useScheme()];
  const hasTabBar = underTabBar ?? !includesBottomEdge(edges);
  // 'bottom' kenarı verildiyse alt payı zaten SafeAreaView ekler.
  const paddingBottom = hasTabBar ? TabBarBaseHeight + insets.bottom + Spacing.four : Spacing.four;

  const inner = <View style={[s.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={s.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}>
          {inner}
        </ScrollView>
      ) : (
        <View style={[s.scroll, { paddingBottom }]}>{inner}</View>
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
  flat,
  ...rest
}: ViewProps & { tone?: 'default' | 'strong' | 'primary' | 'accent'; flat?: boolean }) {
  const s = layout[useScheme()];
  return (
    <View style={[s.card, !flat && s.cardShadow, s[`card_${tone}`], style]} {...rest}>
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
  const s = layout[useScheme()];
  return (
    <View style={[s.sectionTitle, style]}>
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
  return <View style={[layout[useScheme()].divider, style]} />;
}

const layout = forEachScheme((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    scroll: { flexGrow: 1, alignItems: 'center' },
    content: {
      width: '100%',
      maxWidth: MaxContentWidth,
      paddingHorizontal: Spacing.three,
      gap: Spacing.three,
      paddingTop: Spacing.two,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      padding: Spacing.three + 2,
      gap: Spacing.two,
    },
    // Açık temada kartlar çerçeveyle değil gölgeyle ayrılır; koyu temada
    // gölge görünmediği için ince bir çerçeve kalır.
    cardShadow: c.scheme === 'light' ? shadow(c, 1) : { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border },
    card_default: {},
    card_strong: { backgroundColor: c.cardStrong },
    card_primary: { backgroundColor: c.primarySoft },
    card_accent: { backgroundColor: c.accentSoft },
    sectionTitle: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, marginTop: Spacing.two },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: Spacing.one },
  }),
);

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
  const c = useColors();
  const s = btn[c.scheme];
  const isDisabled = disabled || loading;
  const fg = variant === 'primary' ? c.onPrimary : variant === 'danger' ? c.danger : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        s.base,
        s[variant],
        small && s.small,
        pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        isDisabled && { opacity: 0.45 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 15 : 18} color={fg} /> : null}
          <Text style={[s.text, { color: fg }, small && { fontSize: 13.5 }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const btn = forEachScheme((c) =>
  StyleSheet.create<Record<ButtonVariant | 'base' | 'text' | 'small', ViewStyle & TextStyle>>({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingVertical: 15,
      paddingHorizontal: Spacing.four,
      borderRadius: Radius.pill,
    },
    small: { paddingVertical: 9, paddingHorizontal: Spacing.three },
    text: { fontFamily: FontFamily.sansBold, fontSize: 15 },
    primary: { backgroundColor: c.primary },
    secondary: { backgroundColor: c.cardStrong },
    ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.borderStrong },
    danger: { backgroundColor: c.scheme === 'light' ? 'rgba(194,69,90,0.10)' : 'rgba(240,100,122,0.12)' },
  }),
);

/**
 * Yumuşak dolgulu etiket. Çerçeve yerine zemin tonu kullanılır — üst üste
 * gelen çerçeveli etiketler arayüzü kalabalık gösteriyordu.
 */
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
  const c = useColors();
  const s = chip[c.scheme];
  const tint = color ?? c.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [s.base, active && { backgroundColor: `${tint}22` }, pressed && { opacity: 0.7 }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={active ? tint : c.textSecondary} /> : null}
      <Text style={[s.text, active && { color: tint, fontFamily: FontFamily.sansBold }]}>{label}</Text>
    </Pressable>
  );
}

const chip = forEachScheme((c) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: Radius.pill,
      backgroundColor: c.cardStrong,
    },
    text: { color: c.textSecondary, fontFamily: FontFamily.sansSemiBold, fontSize: 13.5 },
  }),
);

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
  const c = useColors();
  const s = row[c.scheme];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [s.base, pressed && onPress ? { backgroundColor: c.cardStrong } : null, style]}
      {...rest}>
      {left ? <View style={s.left}>{left}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {typeof title === 'string' ? <T variant="subheading">{title}</T> : title}
        {subtitle ? typeof subtitle === 'string' ? <T variant="small">{subtitle}</T> : subtitle : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={c.muted} /> : null)}
    </Pressable>
  );
}

const row = forEachScheme((c) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: 13,
      paddingHorizontal: Spacing.three,
      borderRadius: Radius.md,
    },
    left: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: c.cardStrong },
  }),
);

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
  const c = useColors();
  const s = empty[c.scheme];
  return (
    <View style={s.base}>
      <View style={s.iconWrap}>
        <Ionicons name={icon} size={34} color={c.primary} />
      </View>
      <T variant="title" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {body ? (
        <T variant="small" style={{ textAlign: 'center', maxWidth: 320 }}>
          {body}
        </T>
      ) : null}
      {action ? <View style={{ marginTop: Spacing.three }}>{action}</View> : null}
    </View>
  );
}

const empty = forEachScheme((c) =>
  StyleSheet.create({
    base: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.six, paddingHorizontal: Spacing.four },
    iconWrap: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.two,
    },
  }),
);

export function Badge({ label, color }: { label: string; color?: string }) {
  const c = useColors();
  const tint = color ?? c.accent;
  return (
    <View style={{ backgroundColor: `${tint}22`, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color: tint, fontFamily: FontFamily.sansBold, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

/** Yatay ilerleme çubuğu (0–100) */
export function Bar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const c = useColors();
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: c.cardStrong, overflow: 'hidden', flex: 1 }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          backgroundColor: color ?? c.primary,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}
