import { useMemo } from 'react';

import { computeNatalChart } from '@/astro/chart';
import { ASPECTS } from '@/astro/constants';
import { computeSynastry } from '@/astro/synastry';
import { computeTransits } from '@/astro/transits';
import type { AspectType, NatalChart, SynastryReport, TransitReport } from '@/astro/types';
import { profileToBirthInput, useAppStore, type Profile } from '@/store/useAppStore';

const ALL_ASPECTS = Object.keys(ASPECTS) as AspectType[];
const MAJOR_ASPECTS = ALL_ASPECTS.filter((t) => ASPECTS[t].major || t === 'quincunx');

/** Profil → hesaplanmış natal harita (ayarlara göre, memoize) */
export function useNatalChart(profile: Profile | undefined | null): NatalChart | null {
  const houseSystem = useAppStore((s) => s.settings.houseSystem);
  const nodeType = useAppStore((s) => s.settings.nodeType);
  const showMinor = useAppStore((s) => s.settings.showMinorAspects);
  return useMemo(() => {
    if (!profile) return null;
    try {
      return computeNatalChart(profileToBirthInput(profile), {
        houseSystem,
        nodeType,
        aspectTypes: showMinor ? ALL_ASPECTS : MAJOR_ASPECTS,
      });
    } catch (e) {
      console.warn('Harita hesaplanamadı', e);
      return null;
    }
  }, [profile, houseSystem, nodeType, showMinor]);
}

/** Verilen an için transit raporu (dakika hassasiyetinde memoize) */
export function useTransits(chart: NatalChart | null, date: Date): TransitReport | null {
  const minuteKey = Math.floor(date.getTime() / 60000);
  return useMemo(() => {
    if (!chart) return null;
    return computeTransits(chart, new Date(minuteKey * 60000));
  }, [chart, minuteKey]);
}

export function useSynastry(a: NatalChart | null, b: NatalChart | null): SynastryReport | null {
  return useMemo(() => (a && b ? computeSynastry(a, b) : null), [a, b]);
}
