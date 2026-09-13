/**
 * Yapay zekâ yorumları için küçük bir Markdown görüntüleyici:
 * #/## başlık, - madde, **kalın**, _italik_, paragraf.
 */
import { Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(
        <Text key={`${keyPrefix}b${i++}`} style={styles.bold}>
          {tok.slice(2, -2)}
        </Text>,
      );
    } else {
      parts.push(
        <Text key={`${keyPrefix}i${i++}`} style={styles.italic}>
          {tok.slice(1, -1)}
        </Text>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flush = () => {
    if (!para.length) return;
    const t = para.join(' ');
    blocks.push(
      <Text key={`p${key++}`} style={styles.p}>
        {inline(t, `p${key}`)}
      </Text>,
    );
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      flush();
      const level = h[1].length;
      blocks.push(
        <Text key={`h${key++}`} style={[styles.h, level === 1 ? styles.h1 : level === 2 ? styles.h2 : styles.h3]}>
          {h[2].replace(/\*\*/g, '')}
        </Text>,
      );
      continue;
    }
    const li = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    if (li) {
      flush();
      blocks.push(
        <View key={`l${key++}`} style={styles.li}>
          <Text style={styles.bullet}>•</Text>
          <Text style={[styles.p, { flex: 1, marginBottom: 0 }]}>{inline(li[1], `l${key}`)}</Text>
        </View>,
      );
      continue;
    }
    para.push(line.trim());
  }
  flush();

  return (
    <View style={{ gap: 2 }}>
      {blocks.map((b, i) => (
        <Fragment key={i}>{b}</Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  p: { color: Colors.text, fontSize: 15.5, lineHeight: 24, marginBottom: Spacing.two },
  h: { color: Colors.primary, fontWeight: '700', marginTop: Spacing.three, marginBottom: Spacing.one },
  h1: { fontSize: 22, lineHeight: 28 },
  h2: { fontSize: 18, lineHeight: 24 },
  h3: { fontSize: 16, lineHeight: 22, color: Colors.text },
  li: { flexDirection: 'row', gap: 8, paddingLeft: 4, marginBottom: 6 },
  bullet: { color: Colors.primary, fontSize: 15.5, lineHeight: 24 },
  bold: { fontWeight: '700', color: Colors.text },
  italic: { fontStyle: 'italic', color: Colors.textSecondary },
});
