import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { SHARED_FILES, renderShared } from '../../scripts/sync-shared.mjs';

/**
 * supabase/functions/_shared/ altındaki kopyalar src/ai/ ile aynı olmalı.
 * Biri değişip diğeri unutulursa vekil eski istemi kullanır — bu test onu yakalar.
 */
describe('paylaşılan istem dosyaları', () => {
  it.each(SHARED_FILES)('%s güncel (npm run sync:shared)', (name: string) => {
    const copy = readFileSync(resolve(__dirname, '../../supabase/functions/_shared', name), 'utf8');
    expect(copy, `supabase/functions/_shared/${name} eski — "npm run sync:shared" çalıştır`).toBe(renderShared(name));
  });

  it('Deno açık .ts uzantısı ister', () => {
    const fn = readFileSync(resolve(__dirname, '../../supabase/functions/interpret/index.ts'), 'utf8');
    const relativeImports = [...fn.matchAll(/from '(\.[^']*)'/g)].map((m) => m[1]);
    expect(relativeImports.length).toBeGreaterThan(0);
    for (const spec of relativeImports) expect(spec).toMatch(/\.ts$/);
  });
});
