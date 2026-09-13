import { DateTime, IANAZone } from 'luxon';

import type { BirthInput } from './types';

export interface LocalToUtcResult {
  utc: Date;
  /** Yerel saatin UTC'den farkı (dakika, doğu pozitif) */
  offsetMinutes: number;
  /** Doğum saati bilinmediği için öğlen kullanıldı mı */
  usedNoon: boolean;
}

export function isValidTimeZone(zone: string): boolean {
  try {
    return IANAZone.isValidZone(zone);
  } catch {
    return false;
  }
}

/**
 * Yerel doğum tarihi/saati → UTC.
 * Tarihsel yaz saati kuralları (örn. Türkiye 1978–2016) IANA veritabanından gelir.
 */
export function localToUtc(input: BirthInput): LocalToUtcResult {
  if (!isValidTimeZone(input.timeZone)) {
    throw new Error(`Bilinmeyen saat dilimi: ${input.timeZone}`);
  }
  const usedNoon = !!input.timeUnknown;
  const dt = DateTime.fromObject(
    {
      year: input.year,
      month: input.month,
      day: input.day,
      hour: usedNoon ? 12 : input.hour,
      minute: usedNoon ? 0 : input.minute,
      second: usedNoon ? 0 : (input.second ?? 0),
    },
    { zone: input.timeZone },
  );
  if (!dt.isValid) {
    throw new Error(`Geçersiz tarih/saat: ${dt.invalidReason ?? ''} ${dt.invalidExplanation ?? ''}`.trim());
  }
  return { utc: dt.toUTC().toJSDate(), offsetMinutes: dt.offset, usedNoon };
}

/** UTC anını verilen saat diliminde Türkçe biçimlendirir: "14 Mart 1990, 10:35" */
export function formatLocal(utc: Date, zone: string, withTime = true): string {
  const dt = DateTime.fromJSDate(utc, { zone }).setLocale('tr');
  return withTime ? dt.toFormat('d MMMM yyyy, HH:mm') : dt.toFormat('d MMMM yyyy');
}

/** "+03:00" biçiminde UTC farkı */
export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60)
    .toString()
    .padStart(2, '0');
  const m = (abs % 60).toString().padStart(2, '0');
  return `${sign}${h}:${m}`;
}
