import { describe, expect, it } from 'vitest';

import { buildStyleSection, type StyleExample } from '../../src/ai/houseStyle';
import { systemPrompt, buildUserPrompt } from '../../src/ai/promptText';

const EXAMPLE: StyleExample[] = [
  { label: 'Natal — Genel Bakış', text: 'Haritanın merkezinde bir gerilim var: hızlı karar veren bir zihin, temkinli bir yürek.' },
];

describe('ev üslubu', () => {
  it('hiçbir şey tanımlı değilse istem değişmez', () => {
    expect(buildStyleSection('', [])).toBe('');
    expect(buildStyleSection('   ', [{ label: 'boş', text: '  ' }])).toBe('');
  });

  it('kurallar ve örnekler istemde yer alır', () => {
    const s = buildStyleSection('Her bölüme bir soruyla başla.', EXAMPLE);
    expect(s).toContain('# Ev üslubu');
    expect(s).toContain('Her bölüme bir soruyla başla.');
    expect(s).toContain('<ornek etiket="Natal — Genel Bakış">');
    expect(s).toContain('hızlı karar veren bir zihin');
    // Kopyalama yasağı örneklerle birlikte mutlaka gitmeli
    expect(s).toContain('kopyalama');
    expect(s).toContain('BAŞKA haritalara aittir');
  });

  it('yalnızca kural verilince örnek bölümü açılmaz', () => {
    const s = buildStyleSection('Kısa cümle kur.', []);
    expect(s).toContain('Üslup kuralları');
    expect(s).not.toContain('<ornek');
  });

  it('sistem istemi temel ilkeleri her hâlükârda taşır', () => {
    const prompt = systemPrompt('tr');
    expect(prompt).toContain('Kaderci olma');
    expect(prompt).toContain('veride olmayan yerleşimler uydurma');
  });

  it('kullanıcı istemi harita verisini ve bölüm planını içerir', () => {
    const p = buildUserPrompt('natal', '## Gezegenler\n- Güneş: 24°06\' İkizler');
    expect(p).toContain("Güneş: 24°06' İkizler");
    expect(p).toContain('## Öne Çıkan Açılar');
  });
});
