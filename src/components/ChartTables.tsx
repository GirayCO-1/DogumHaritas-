import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ASPECTS, BODIES, ELEMENT_NAMES, HOUSE_NAMES, MODALITY_NAMES, SIGNS } from '@/astro/constants';
import { DIGNITY_NAMES } from '@/astro/dignities';
import { formatDegMin, formatSpeed } from '@/astro/format';
import type { Aspect, BodyId, BodyPosition, Dignity, ElementBalance, ModalityBalance, NatalChart } from '@/astro/types';
import { AspectColors, Colors, ElementColors, Radius, Spacing } from '@/constants/theme';

import { BodyGlyph, SignGlyph, bodyColor, signColor } from './Glyph';
import { Badge, Bar, Card, Divider, Row, T } from './ui';

/* ------------------------------------------------------------------ */
/* Gezegen tablosu                                                     */
/* ------------------------------------------------------------------ */

export function PlanetTable({
  chart,
  selected,
  onSelect,
  showPoints = true,
}: {
  chart: NatalChart;
  selected?: BodyId | null;
  onSelect?: (id: BodyId | null) => void;
  showPoints?: boolean;
}) {
  const dignityOf = new Map(chart.dignities.map((d) => [d.body, d.kind]));
  const rows: BodyPosition[] = [...chart.planets, ...(showPoints ? chart.points.filter((p) => p.id === 'asc' || p.id === 'mc' || p.id === 'fortune' || p.id === 'vertex') : [])];
  return (
    <Card style={{ padding: 0, gap: 0 }}>
      {rows.map((p, i) => {
        const isSel = selected === p.id;
        const dg = dignityOf.get(p.id as Dignity['body']);
        return (
          <Fragment key={p.id}>
            {i > 0 && <Divider style={{ marginVertical: 0 }} />}
            <Pressable
              onPress={() => onSelect?.(isSel ? null : p.id)}
              style={({ pressed }) => [tbl.row, (pressed || isSel) && { backgroundColor: Colors.cardStrong }]}>
              <View style={tbl.glyphBox}>
                <BodyGlyph id={p.id} size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Row gap={6}>
                  <T variant="subheading">{BODIES[p.id].name}</T>
                  {p.retrograde && <Badge label="℞ Retro" color={Colors.danger} />}
                  {dg && <Badge label={DIGNITY_NAMES[dg].split(' ')[0]} color={dg === 'domicile' || dg === 'exaltation' ? Colors.success : Colors.warning} />}
                </Row>
                <T variant="small">
                  {p.house}. ev · {HOUSE_NAMES[p.house - 1]}
                </T>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Row gap={4}>
                  <T variant="mono" color={Colors.text}>
                    {formatDegMin(p.longitude)}
                  </T>
                  <SignGlyph sign={p.sign} size={16} />
                </Row>
                <T variant="caption" color={signColor(p.sign)}>
                  {SIGNS[p.sign].name}
                </T>
              </View>
            </Pressable>
          </Fragment>
        );
      })}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Seçili gezegen detayı                                               */
/* ------------------------------------------------------------------ */

export function BodyDetail({ chart, id }: { chart: NatalChart; id: BodyId }) {
  const p = [...chart.planets, ...chart.points].find((x) => x.id === id);
  if (!p) return null;
  const asp = chart.aspects.filter((a) => a.a === id || a.b === id);
  const dg = chart.dignities.find((d) => d.body === id);
  return (
    <Card tone="strong">
      <Row>
        <BodyGlyph id={id} size={26} />
        <View style={{ flex: 1 }}>
          <T variant="heading">
            {BODIES[id].name} · {formatDegMin(p.longitude)} {SIGNS[p.sign].name}
          </T>
          <T variant="small">
            {p.house}. ev · {HOUSE_NAMES[p.house - 1]}
            {BODIES[id].physical ? ` · ${formatSpeed(p.speed)}${p.retrograde ? ' (retro)' : ''}` : ''}
          </T>
        </View>
      </Row>
      {dg && <T variant="small" color={Colors.primary}>{DIGNITY_NAMES[dg.kind]}</T>}
      {asp.length > 0 && (
        <View style={{ gap: 6 }}>
          <T variant="label">Açılar</T>
          {asp.map((a, i) => {
            const other = a.a === id ? a.b : a.a;
            const info = ASPECTS[a.type];
            return (
              <Row key={i} gap={8}>
                <T color={aspectColor(a)} style={{ width: 18, textAlign: 'center' }}>
                  {info.symbol}
                </T>
                <BodyGlyph id={other} size={16} />
                <T style={{ flex: 1 }}>
                  {info.name} {BODIES[other].name}
                </T>
                <T variant="mono">
                  {Math.abs(a.orb).toFixed(1)}° {a.applying ? '↗' : '↘'}
                </T>
              </Row>
            );
          })}
        </View>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Evler                                                               */
/* ------------------------------------------------------------------ */

export function HouseTable({ chart }: { chart: NatalChart }) {
  return (
    <Card style={{ padding: 0, gap: 0 }}>
      {chart.houses.cusps.map((c, i) => {
        const sign = Math.floor(c / 30) % 12;
        const inHouse = chart.planets.filter((p) => p.house === i + 1 && p.id !== 'southNode');
        return (
          <Fragment key={i}>
            {i > 0 && <Divider style={{ marginVertical: 0 }} />}
            <View style={tbl.row}>
              <View style={[tbl.glyphBox, { backgroundColor: Colors.primarySoft }]}>
                <T variant="subheading" color={Colors.primary}>
                  {i + 1}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="subheading">{HOUSE_NAMES[i]}</T>
                <Row gap={4} style={{ flexWrap: 'wrap' }}>
                  {inHouse.length ? inHouse.map((p) => <BodyGlyph key={p.id} id={p.id} size={14} />) : <T variant="caption">boş</T>}
                </Row>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Row gap={4}>
                  <T variant="mono" color={Colors.text}>
                    {formatDegMin(c)}
                  </T>
                  <SignGlyph sign={sign} size={16} />
                </Row>
                <T variant="caption" color={signColor(sign)}>
                  {SIGNS[sign].name}
                </T>
              </View>
            </View>
          </Fragment>
        );
      })}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Açılar                                                              */
/* ------------------------------------------------------------------ */

export function aspectColor(a: Aspect): string {
  const info = ASPECTS[a.type];
  if (!info.major) return AspectColors.minor;
  if (a.type === 'conjunction') return AspectColors.conjunction;
  return info.nature === 'harmonious' ? AspectColors.harmonious : AspectColors.tense;
}

export function AspectList({
  aspects,
  labelA,
  labelB,
  emptyText = 'Açı bulunamadı.',
}: {
  aspects: Aspect[];
  labelA?: string;
  labelB?: string;
  emptyText?: string;
}) {
  if (!aspects.length)
    return (
      <Card>
        <T variant="small">{emptyText}</T>
      </Card>
    );
  return (
    <Card style={{ padding: 0, gap: 0 }}>
      {aspects.map((a, i) => {
        const info = ASPECTS[a.type];
        const color = aspectColor(a);
        return (
          <Fragment key={`${a.a}-${a.b}-${a.type}`}>
            {i > 0 && <Divider style={{ marginVertical: 0 }} />}
            <View style={tbl.row}>
              <View style={[tbl.glyphBox, { backgroundColor: `${color}22` }]}>
                <T style={{ fontSize: 20, color }}>{info.symbol}</T>
              </View>
              <View style={{ flex: 1 }}>
                <Row gap={6}>
                  <BodyGlyph id={a.a} size={16} />
                  <T variant="subheading">{BODIES[a.a].name}</T>
                  <T variant="small" color={color}>
                    {info.name.toLowerCase()}
                  </T>
                  <BodyGlyph id={a.b} size={16} />
                  <T variant="subheading">{BODIES[a.b].name}</T>
                </Row>
                {labelA && labelB ? (
                  <T variant="caption">
                    {labelA} → {labelB}
                  </T>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T variant="mono" color={Colors.text}>
                  {Math.abs(a.orb).toFixed(1)}°
                </T>
                <T variant="caption">{a.applying ? 'yaklaşan' : 'uzaklaşan'}</T>
              </View>
            </View>
          </Fragment>
        );
      })}
    </Card>
  );
}

/** Üçgen açı matrisi */
export function AspectGrid({ chart, bodies }: { chart: NatalChart; bodies?: readonly BodyId[] }) {
  const ids: BodyId[] = (bodies ?? ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode', 'asc', 'mc']).filter((id) =>
    [...chart.planets, ...chart.points].some((p) => p.id === id),
  );
  const key = (a: BodyId, b: BodyId) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const map = new Map(chart.aspects.map((a) => [key(a.a, a.b), a]));
  const cell = 30;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {ids.map((rowId, r) => (
          <Row key={rowId} gap={0}>
            <View style={[grid.cell, { width: cell + 8, backgroundColor: 'transparent', borderWidth: 0 }]}>
              <BodyGlyph id={rowId} size={15} />
            </View>
            {ids.slice(0, r).map((colId) => {
              const a = map.get(key(rowId, colId));
              const color = a ? aspectColor(a) : undefined;
              return (
                <View key={colId} style={[grid.cell, { width: cell, height: cell }, a && { backgroundColor: `${color}22` }]}>
                  {a ? <T style={{ color, fontSize: 15 }}>{ASPECTS[a.type].symbol}</T> : null}
                </View>
              );
            })}
            <View style={[grid.cell, { width: cell, height: cell, backgroundColor: Colors.cardStrong }]}>
              <BodyGlyph id={rowId} size={15} />
            </View>
          </Row>
        ))}
      </View>
    </ScrollView>
  );
}

const grid = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
});

/* ------------------------------------------------------------------ */
/* Element / nitelik dengesi                                           */
/* ------------------------------------------------------------------ */

export function BalanceBars({ elements, modalities }: { elements: ElementBalance; modalities: ModalityBalance }) {
  const eTotal = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const mTotal = Object.values(modalities).reduce((a, b) => a + b, 0) || 1;
  return (
    <Card>
      <T variant="label">Elementler</T>
      {(Object.keys(elements) as (keyof ElementBalance)[]).map((k) => (
        <Row key={k} gap={10}>
          <T variant="small" style={{ width: 62 }} color={ElementColors[k]}>
            {ELEMENT_NAMES[k]}
          </T>
          <Bar value={(elements[k] / eTotal) * 100} color={ElementColors[k]} />
          <T variant="mono" style={{ width: 38, textAlign: 'right' }}>
            {Math.round((elements[k] / eTotal) * 100)}%
          </T>
        </Row>
      ))}
      <Divider />
      <T variant="label">Nitelikler</T>
      {(Object.keys(modalities) as (keyof ModalityBalance)[]).map((k) => (
        <Row key={k} gap={10}>
          <T variant="small" style={{ width: 62 }}>
            {MODALITY_NAMES[k]}
          </T>
          <Bar value={(modalities[k] / mTotal) * 100} color={Colors.accent} />
          <T variant="mono" style={{ width: 38, textAlign: 'right' }}>
            {Math.round((modalities[k] / mTotal) * 100)}%
          </T>
        </Row>
      ))}
    </Card>
  );
}

/** Üçlü özet: Güneş / Ay / Yükselen */
export function BigThree({ chart }: { chart: NatalChart }) {
  const items: { label: string; id: BodyId; sign: number }[] = [
    { label: 'Güneş', id: 'sun', sign: chart.summary.sunSign },
    { label: 'Ay', id: 'moon', sign: chart.summary.moonSign },
    { label: 'Yükselen', id: 'asc', sign: chart.summary.ascSign },
  ];
  return (
    <Row gap={Spacing.two}>
      {items.map((it) => (
        <View key={it.id} style={big.item}>
          <Row gap={6}>
            <BodyGlyph id={it.id} size={16} />
            <T variant="caption">{it.label}</T>
          </Row>
          <Row gap={6}>
            <SignGlyph sign={it.sign} size={22} />
            <T variant="subheading" color={signColor(it.sign)}>
              {SIGNS[it.sign].name}
            </T>
          </Row>
        </View>
      ))}
    </Row>
  );
}

const big = StyleSheet.create({
  item: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    padding: 12,
    gap: 6,
  },
});

const tbl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 },
  glyphBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cardStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function RetroIcon() {
  return <Ionicons name="refresh" size={12} color={Colors.danger} />;
}

export { bodyColor };
