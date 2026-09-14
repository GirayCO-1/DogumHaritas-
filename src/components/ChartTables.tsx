import { Ionicons } from '@expo/vector-icons';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ASPECTS, BODIES } from '@/astro/constants';
import { formatDegMin, formatSpeed } from '@/astro/format';
import type { Aspect, BodyId, BodyPosition, Dignity, ElementBalance, ModalityBalance, NatalChart } from '@/astro/types';
import { useAstro, useT } from '@/i18n';
import { Radius, Spacing, forEachScheme, shadow, useAspectColors, useColors, useElementColors, useScheme, type AspectPalette } from '@/constants/theme';

import { BodyGlyph, SignGlyph, useSignColor } from './Glyph';
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
  const t = useT();
  const astro = useAstro();
  const Colors = useColors();
  const signColor = useSignColor();
  const tbl = tblSets[useScheme()];
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
                  <T variant="subheading">{astro.bodies[p.id]}</T>
                  {p.retrograde && <Badge label={t.chart.retroBadge} color={Colors.danger} />}
                  {dg && <Badge label={astro.dignities[dg].split(' ')[0]} color={dg === 'domicile' || dg === 'exaltation' ? Colors.success : Colors.warning} />}
                </Row>
                <T variant="small">
                  {t.chart.houseN(p.house)} · {astro.houses[p.house - 1]}
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
                  {astro.signs[p.sign]}
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
  const t = useT();
  const astro = useAstro();
  const Colors = useColors();
  const aspectColor = useAspectColor();
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
            {astro.bodies[id]} · {formatDegMin(p.longitude)} {astro.signs[p.sign]}
          </T>
          <T variant="small">
            {t.chart.houseN(p.house)} · {astro.houses[p.house - 1]}
            {BODIES[id].physical ? ` · ${formatSpeed(p.speed, astro.speedUnit)}${p.retrograde ? ` (${t.chart.retro})` : ''}` : ''}
          </T>
        </View>
      </Row>
      {dg && <T variant="small" color={Colors.primary}>{astro.dignities[dg.kind]}</T>}
      {asp.length > 0 && (
        <View style={{ gap: 6 }}>
          <T variant="label">{t.chart.aspects}</T>
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
                  {astro.aspects[a.type]} {astro.bodies[other]}
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
  const t = useT();
  const astro = useAstro();
  const Colors = useColors();
  const signColor = useSignColor();
  const tbl = tblSets[useScheme()];
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
                <T variant="subheading">{astro.houses[i]}</T>
                <Row gap={4} style={{ flexWrap: 'wrap' }}>
                  {inHouse.length ? inHouse.map((p) => <BodyGlyph key={p.id} id={p.id} size={14} />) : <T variant="caption">{t.chart.empty}</T>}
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
                  {astro.signs[sign]}
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

export function aspectColorOf(a: Aspect, ac: AspectPalette): string {
  const info = ASPECTS[a.type];
  if (!info.major) return ac.minor;
  if (a.type === 'conjunction') return ac.conjunction;
  return info.nature === 'harmonious' ? ac.harmonious : ac.tense;
}

export function useAspectColor(): (a: Aspect) => string {
  const ac = useAspectColors();
  return (a) => aspectColorOf(a, ac);
}

export function AspectList({
  aspects,
  labelA,
  labelB,
  emptyText,
}: {
  aspects: Aspect[];
  labelA?: string;
  labelB?: string;
  emptyText?: string;
}) {
  const t = useT();
  const astro = useAstro();
  const Colors = useColors();
  const aspectColor = useAspectColor();
  const tbl = tblSets[useScheme()];
  if (!aspects.length)
    return (
      <Card>
        <T variant="small">{emptyText ?? t.chart.noAspects}</T>
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
                  <T variant="subheading">{astro.bodies[a.a]}</T>
                  <T variant="small" color={color}>
                    {astro.aspects[a.type].toLowerCase()}
                  </T>
                  <BodyGlyph id={a.b} size={16} />
                  <T variant="subheading">{astro.bodies[a.b]}</T>
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
                <T variant="caption">{a.applying ? t.chart.applying : t.chart.separating}</T>
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
  const Colors = useColors();
  const aspectColor = useAspectColor();
  const grid = gridSets[useScheme()];
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

const gridSets = forEachScheme((c) => StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    backgroundColor: c.card,
  },
}));

/* ------------------------------------------------------------------ */
/* Element / nitelik dengesi                                           */
/* ------------------------------------------------------------------ */

export function BalanceBars({ elements, modalities }: { elements: ElementBalance; modalities: ModalityBalance }) {
  const t = useT();
  const astro = useAstro();
  const Colors = useColors();
  const ElementColors = useElementColors();
  const eTotal = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const mTotal = Object.values(modalities).reduce((a, b) => a + b, 0) || 1;
  return (
    <Card>
      <T variant="label">{t.chart.elements}</T>
      {(Object.keys(elements) as (keyof ElementBalance)[]).map((k) => (
        <Row key={k} gap={10}>
          <T variant="small" style={{ width: 62 }} color={ElementColors[k]}>
            {astro.elements[k]}
          </T>
          <Bar value={(elements[k] / eTotal) * 100} color={ElementColors[k]} />
          <T variant="mono" style={{ width: 38, textAlign: 'right' }}>
            {t.common.percent(Math.round((elements[k] / eTotal) * 100))}
          </T>
        </Row>
      ))}
      <Divider />
      <T variant="label">{t.chart.modalities}</T>
      {(Object.keys(modalities) as (keyof ModalityBalance)[]).map((k) => (
        <Row key={k} gap={10}>
          <T variant="small" style={{ width: 62 }}>
            {astro.modalities[k]}
          </T>
          <Bar value={(modalities[k] / mTotal) * 100} color={Colors.accent} />
          <T variant="mono" style={{ width: 38, textAlign: 'right' }}>
            {t.common.percent(Math.round((modalities[k] / mTotal) * 100))}
          </T>
        </Row>
      ))}
    </Card>
  );
}

/**
 * Kompakt element şeridi — ana ekranda görünsün diye.
 * Element dengesi haritanın en çabuk okunan göstergelerinden biri;
 * "Denge" sekmesine gömülü kalmamalı.
 */
export function ElementStrip({ elements }: { elements: ElementBalance }) {
  const t = useT();
  const astro = useAstro();
  const ElementColors = useElementColors();
  const total = Object.values(elements).reduce((a, b) => a + b, 0) || 1;
  const keys = Object.keys(elements) as (keyof ElementBalance)[];
  const weakest = keys.reduce((lo, k) => (elements[k] < elements[lo] ? k : lo));
  return (
    <Card style={{ gap: 8 }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <T variant="label">{t.chart.elementBalance}</T>
        <T variant="caption">{t.chart.weakest(astro.elements[weakest])}</T>
      </Row>
      <Row gap={6}>
        {keys.map((k) => {
          const pct = Math.round((elements[k] / total) * 100);
          return (
            <View key={k} style={{ flex: Math.max(1, elements[k]), gap: 5 }}>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: ElementColors[k] }} />
              <T variant="caption" color={ElementColors[k]} numberOfLines={1}>
                {astro.elements[k]} {t.common.percent(pct)}
              </T>
            </View>
          );
        })}
      </Row>
    </Card>
  );
}

/** Üçlü özet: Güneş / Ay / Yükselen */
export function BigThree({ chart }: { chart: NatalChart }) {
  const astro = useAstro();
  const signColor = useSignColor();
  const big = bigSets[useScheme()];
  const items: { id: BodyId; sign: number }[] = [
    { id: 'sun', sign: chart.summary.sunSign },
    { id: 'moon', sign: chart.summary.moonSign },
    { id: 'asc', sign: chart.summary.ascSign },
  ];
  return (
    <Row gap={Spacing.two} align="stretch">
      {items.map((it) => (
        <View key={it.id} style={big.item}>
          <View style={big.glyph}>
            <SignGlyph sign={it.sign} size={26} />
          </View>
          <T variant="heading" color={signColor(it.sign)} numberOfLines={1}>
            {astro.signs[it.sign]}
          </T>
          <Row gap={5}>
            <BodyGlyph id={it.id} size={13} />
            <T variant="caption" numberOfLines={1}>
              {astro.bodies[it.id]}
            </T>
          </Row>
        </View>
      ))}
    </Row>
  );
}

const bigSets = forEachScheme((c) => StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: c.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    gap: 6,
    ...(c.scheme === 'light'
      ? shadow(c, 1)
      : { borderWidth: StyleSheet.hairlineWidth, borderColor: c.border }),
  },
  glyph: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.cardStrong,
    marginBottom: 2,
  },
}));

const tblSets = forEachScheme((c) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 },
  glyphBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: c.cardStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export function RetroIcon() {
  const Colors = useColors();
  return <Ionicons name="refresh" size={12} color={Colors.danger} />;
}
