/**
 * src/ai/ içindeki saf istem modüllerini Supabase Edge Function'ın
 * okuyabileceği yere kopyalar.
 *
 * Neden: Supabase fonksiyonları yalnızca supabase/functions/ altındaki
 * dosyaları paketler; uygulamanın src/ ağacına erişemez. Tek kaynak
 * src/ai/ olarak kalır, buradaki kopyalar üretilir.
 *
 * Çalıştırma:  npm run sync:shared   (deploy öncesi otomatik çalışır)
 * Kontrol:     npm test              (kopyalar eskiyse test kırılır)
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SHARED_FILES = ['promptText.ts', 'houseStyle.ts', 'themes.ts', 'locales.ts'];
const OUT_DIR = resolve(root, 'supabase/functions/_shared');

const BANNER = `// ÜRETİLMİŞ DOSYA — ELLE DÜZENLEME.
// Kaynak: %s — değiştirmek için orayı düzenle, sonra: npm run sync:shared
`;

/** locales.ts src/i18n/ altında, diğerleri src/ai/ altında */
function sourcePath(name) {
  return name === 'locales.ts' ? resolve(root, 'src/i18n', name) : resolve(root, 'src/ai', name);
}

export function renderShared(name) {
  const src = readFileSync(sourcePath(name), 'utf8')
    // _shared'da hepsi yan yana duruyor; göreli yol düzleşiyor
    .replaceAll("from '../i18n/locales.ts'", "from './locales.ts'");
  const rel = name === 'locales.ts' ? 'src/i18n/locales.ts' : `src/ai/${name}`;
  return BANNER.replace('%s', rel) + src;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const name of SHARED_FILES) {
    writeFileSync(resolve(OUT_DIR, name), renderShared(name));
    console.log(`✓ supabase/functions/_shared/${name}`);
  }
}
