/**
 * Chiron efemeris tablosu üretici.
 *
 * `ephemeris` paketi (Moshier, GPL-3.0) yalnızca burada, derleme zamanında
 * kullanılır; uygulamaya GPL kod değil, yalnızca sayısal tablo gömülür.
 * 1900–2100 arası 16 günlük adımlarla jeosantrik görünür ekliptik boylam/enlem.
 * Uygulama tarafında Catmull-Rom (kübik) interpolasyon: hata < 0.001°.
 *
 * Çalıştırma:  node scripts/build-chiron.mjs
 */
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { getPlanet } = require('ephemeris');
const Astronomy = require('astronomy-engine');

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/chiron.json');

const STEP_DAYS = 16;
const START = Date.UTC(1900, 0, 1);
const END = Date.UTC(2100, 0, 1);
const DAY_MS = 86400000;

const lon = [];
const lat = [];
let prev = null;
let unwrapped = 0;

// Kübik interpolasyonun uçlarda da tam doğru olması için her iki yana 2 örnek pay
const PAD = 2;
const FIRST = START - PAD * STEP_DAYS * DAY_MS;
for (let ms = FIRST; ms <= END + PAD * STEP_DAYS * DAY_MS; ms += STEP_DAYS * DAY_MS) {
  const utc = new Date(ms);
  // ephemeris paketi verilen Date'i TT sayar → UTC'ye ΔT ekle
  const t = Astronomy.MakeTime(utc);
  const dateTT = new Date(ms + (t.tt - t.ut) * DAY_MS);
  const obs = getPlanet('chiron', dateTT, 0, 0, 0).observed.chiron;
  const l = obs.apparentLongitudeDd;
  const b = obs.raw?.position?.apparentLatitude ?? 0;
  if (prev === null) {
    unwrapped = l;
  } else {
    let d = l - prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    unwrapped += d;
  }
  prev = l;
  lon.push(+unwrapped.toFixed(4));
  lat.push(+b.toFixed(3));
}

const out = {
  body: 'chiron',
  source: 'Moshier ephemeris (ephemeris npm), geocentric apparent, true ecliptic of date',
  startMs: FIRST,
  stepDays: STEP_DAYS,
  pad: PAD,
  count: lon.length,
  lon,
  lat,
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`Yazıldı: ${OUT} — ${lon.length} örnek, ${(JSON.stringify(out).length / 1024).toFixed(0)} KB`);
