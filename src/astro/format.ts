/**
 * Sayısal biçimlendirme — dile bağımsız.
 *
 * Burç, gezegen ve açı ADLARI burada değil `src/astro/i18n.ts` içindedir;
 * bu modül yalnızca derece/dakika gibi dilden bağımsız biçimleri üretir.
 * Tek dile bağlı şey günlük hız birimi, o da parametre olarak gelir.
 */
import { splitDegrees, zodiacPosition } from './math';

const pad2 = (n: number) => n.toString().padStart(2, '0');

/** 15°32' biçimi (burç içi derece) */
export function formatDegMin(longitude: number, withSeconds = false): string {
  const z = zodiacPosition(longitude);
  return withSeconds ? `${z.deg}°${pad2(z.min)}'${pad2(z.sec)}"` : `${z.deg}°${pad2(z.min)}'`;
}

/** Mutlak boylam: 123°45'12" */
export function formatAbsolute(longitude: number): string {
  const { deg, min, sec } = splitDegrees(longitude);
  return `${deg}°${pad2(min)}'${pad2(sec)}"`;
}

/** İşaretli derece (deklinasyon, enlem): −12°34' */
export function formatSigned(value: number): string {
  const { deg, min } = splitDegrees(value);
  const s = value < 0 ? '−' : '+';
  return `${s}${deg}°${pad2(min)}'`;
}

/**
 * Günlük hız: "+14.01°/gün", "−0.04°/day".
 * Birim dile göre değişir; çağıran `astroText(locale).speedUnit` verir.
 */
export function formatSpeed(speed: number, unit: string): string {
  const s = speed < 0 ? '−' : '+';
  return `${s}${Math.abs(speed).toFixed(2)}${unit}`;
}
