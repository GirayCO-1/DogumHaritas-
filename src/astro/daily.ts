/**
 * Günün özeti — "kozmik nabız", güçlü yanlar ve dikkat edilecekler.
 *
 * Metinler yapay zekâ ile değil, o günün gerçek transitlerinden üretilir:
 * uygulama her açıldığında istek atılmaz, çevrimdışı çalışır ve aynı gün
 * aynı sonucu verir. Ayrıntılı yorum ayrı bir özelliktir (src/ai/).
 *
 * Saf TypeScript: React Native'e bağımlı değildir, vitest ile doğrulanır.
 */
import { ASPECTS, HOUSE_NAMES, SIGNS } from './constants';
import type { BodyId, TransitAspect, TransitReport } from './types';

export interface BriefItem {
  /** Kısa başlık */
  title: string;
  /** Bir cümlelik açıklama */
  text: string;
  /** Hangi transitten türedi — arayüzde küçük not */
  source: string;
}

export interface DailyBrief {
  /** Günün motivasyon cümlesi */
  pulse: string;
  /** Nabzın dayandığı transit */
  pulseSource: string;
  strengths: BriefItem[];
  cautions: BriefItem[];
  /** 0–100 enerji seviyesi: uyumlu ve zorlayıcı açıların dengesi */
  energy: number;
  /** Ay'ın durumu tek satırda */
  moonLine: string;
}

/* ------------------------------------------------------------------ */
/* Metin tabloları                                                     */
/* ------------------------------------------------------------------ */

type Nature = 'harmonious' | 'tense' | 'neutral';

interface Voice {
  /** Motivasyon cümlesi */
  pulse: string;
  /** Madde başlığı */
  title: string;
}

/** Transit gezegen × açı doğası → ses */
const VOICE: Partial<Record<BodyId, Record<Nature, Voice>>> = {
  sun: {
    harmonious: {
      pulse: 'Bugün kendini göstermek için doğal bir alan açılıyor. Göz önünde olmayı zorlamana gerek yok; yeter ki geri çekilme.',
      title: 'Görünürlük',
    },
    tense: {
      pulse: 'Bugün kendini kanıtlama isteği yükselebilir. Onay aramadan da durabildiğini hatırla.',
      title: 'Kanıtlama baskısı',
    },
    neutral: {
      pulse: 'Bugün odak kendine dönüyor. Ne istediğini sessizce netleştirmek için iyi bir gün.',
      title: 'Kendine dönüş',
    },
  },
  moon: {
    harmonious: {
      pulse: 'Bugün içine dönük bir rahatlık var. Hissettiğini bastırmadan taşıyabilirsin.',
      title: 'İç denge',
    },
    tense: {
      pulse: 'Duyguların bugün olduğundan büyük görünebilir. Önemli bir karar vermeden önce akşamı bekle.',
      title: 'Duygusal dalgalanma',
    },
    neutral: {
      pulse: 'Bugün ruh halin hızlı değişebilir; direnmek yerine akışına bırakmak daha az yorar.',
      title: 'Değişken ruh hali',
    },
  },
  mercury: {
    harmonious: {
      pulse: 'Zihnin bugün açık. Uzun süredir ertelediğin o konuşmayı yapmak için iyi bir gün.',
      title: 'Açık iletişim',
    },
    tense: {
      pulse: 'Bugün kelimeler kolay yanlış anlaşılabilir. Göndermeden önce bir kez daha oku.',
      title: 'Yanlış anlaşılma riski',
    },
    neutral: {
      pulse: 'Bugün çok şey duyacaksın; hepsini aynı anda yorumlamak zorunda değilsin.',
      title: 'Yoğun bilgi',
    },
  },
  venus: {
    harmonious: {
      pulse: 'Bugün ilişkilerinde yumuşak bir alan var. Değer verdiğin birine bunu söylemek için bekleme.',
      title: 'Yumuşak temas',
    },
    tense: {
      pulse: 'Bugün beklentiyle gerçek arasındaki fark can sıkabilir. İstediğini açıkça söylemek, ima etmekten kolay.',
      title: 'Beklenti farkı',
    },
    neutral: {
      pulse: 'Bugün neyi ve kimi gerçekten istediğini fark etmek için iyi bir gün.',
      title: 'Değerler',
    },
  },
  mars: {
    harmonious: {
      pulse: 'Bugün harekete geçmek için enerjin yerinde. Küçük ama gerçek bir adım at.',
      title: 'Harekete geçme gücü',
    },
    tense: {
      pulse: 'Enerjin yüksek, sabrın dar. Tepki vermeden önce bir nefes al; acele ettiğinde kaybettiğin şey çoğu zaman zaman olmuyor.',
      title: 'Kısa fitil',
    },
    neutral: {
      pulse: 'Bugün enerjini bir yere yönlendir; yoksa o enerji seni yönlendirir.',
      title: 'Yönlendirilecek enerji',
    },
  },
  jupiter: {
    harmonious: {
      pulse: 'Bugün alan genişliyor. Küçük düşünmek için bir sebep yok.',
      title: 'Genişleyen alan',
    },
    tense: {
      pulse: 'Bugün her şey olduğundan büyük görünebilir. Cömertliğin sınırını da senin çizmen gerekiyor.',
      title: 'Abartma eğilimi',
    },
    neutral: {
      pulse: 'Bugün bir kapı aralanabilir; aralık kaldığı sürece acele etmene gerek yok.',
      title: 'Aralanan kapı',
    },
  },
  saturn: {
    harmonious: {
      pulse: 'Bugün sabrın karşılığını görebilirsin. Yavaş ilerlemek, geri gitmek değildir.',
      title: 'Sağlam zemin',
    },
    tense: {
      pulse: 'Bugün bir sınırla karşılaşabilirsin. Sınır her zaman engel değildir; bazen sadece yön tarifidir.',
      title: 'Sınır ve gecikme',
    },
    neutral: {
      pulse: 'Bugün küçük ve sürdürülebilir olan, büyük ve parlak olandan daha değerli.',
      title: 'Sürdürülebilir adım',
    },
  },
  uranus: {
    harmonious: {
      pulse: 'Bugün alışkanlığını bozmak iyi gelebilir. Küçük bir şeyi başka türlü dene.',
      title: 'Taze bakış',
    },
    tense: {
      pulse: 'Bugün plan bozulabilir. Esnek kalmak, haklı çıkmaktan daha işe yarar.',
      title: 'Ani değişim',
    },
    neutral: {
      pulse: 'Bugün beklenmedik olan, mutlaka kötü olan değildir.',
      title: 'Beklenmedik',
    },
  },
  neptune: {
    harmonious: {
      pulse: 'Bugün sezgin keskin. Açıklayamadığın hislere de kulak ver.',
      title: 'Güçlü sezgi',
    },
    tense: {
      pulse: 'Bugün sınırlar bulanıklaşabilir. Neyin senin, neyin başkasının olduğunu ayırmak işini kolaylaştırır.',
      title: 'Bulanık sınırlar',
    },
    neutral: {
      pulse: 'Bugün her şeyi netleştirmeye çalışma; bazı şeyler kendiliğinden durulur.',
      title: 'Netleşmeyen',
    },
  },
  pluto: {
    harmonious: {
      pulse: 'Bugün bırakman gereken bir şeyi bırakmak sandığından kolay olabilir.',
      title: 'Derin farkındalık',
    },
    tense: {
      pulse: 'Bugün kontrol etme isteği yükselebilir. Tutmadığın şey seni daha az yorar.',
      title: 'Kontrol isteği',
    },
    neutral: {
      pulse: 'Bugün yüzeyin altında bir şey hareket ediyor; zorlamadan bakmak yeterli.',
      title: 'Yüzey altı',
    },
  },
  chiron: {
    harmonious: {
      pulse: 'Bugün eski bir yaraya şefkatle bakabilirsin. İyileşmek, unutmak demek değil.',
      title: 'Şefkatli bakış',
    },
    tense: {
      pulse: 'Bugün hassas bir yere dokunulabilir. Kendine, bir başkasına davranacağın kadar iyi davran.',
      title: 'Hassas nokta',
    },
    neutral: {
      pulse: 'Bugün seni zorlayan şey, aynı zamanda başkasına yardım edebildiğin şey olabilir.',
      title: 'Yara ve şifa',
    },
  },
  northNode: {
    harmonious: {
      pulse: 'Bugün doğru yönde bir adım atmak kolay. Tanıdık olanı değil, doğru olanı seç.',
      title: 'Doğru yön',
    },
    tense: {
      pulse: 'Bugün alışkanlıkla yön arasında bir çekişme var. Konforlu olan hep doğru olan değildir.',
      title: 'Alışkanlığa kaçma',
    },
    neutral: {
      pulse: 'Bugün küçük bir seçim, uzun vadeli bir yönü belirleyebilir.',
      title: 'Yön seçimi',
    },
  },
};

/** Natal cisim → dokunulan yaşam alanı */
const AREA: Partial<Record<BodyId, string>> = {
  sun: 'Özgüvenin ve kendini ifade etme biçimin',
  moon: 'Duyguların ve iç dünyan',
  mercury: 'Düşünme ve konuşma biçimin',
  venus: 'İlişkilerin ve değer verdiklerin',
  mars: 'Enerjin ve harekete geçme biçimin',
  jupiter: 'Büyüme ve genişleme alanın',
  saturn: 'Sorumlulukların ve sınırların',
  uranus: 'Özgürlük ihtiyacın',
  neptune: 'Hayal gücün ve sezgin',
  pluto: 'Dönüşüm alanın',
  chiron: 'Hassas noktan',
  northNode: 'Yaşam yönün',
  asc: 'Dışarıya verdiğin ilk izlenim',
  mc: 'Kariyerin ve toplumsal konumun',
};

/**
 * Transit gezegenin günün temasındaki ağırlığı. Ay her gün her açıyı
 * yaptığı için düşük; yavaş gezegenler günü daha çok belirler.
 */
const TRANSIT_WEIGHT: Partial<Record<BodyId, number>> = {
  moon: 0.6,
  sun: 1.1,
  mercury: 0.9,
  venus: 1,
  mars: 1.1,
  jupiter: 1.3,
  saturn: 1.3,
  uranus: 1.2,
  neptune: 1.1,
  pluto: 1.3,
  chiron: 1,
  northNode: 1.1,
};

/** Natal noktanın kişisel ağırlığı */
const NATAL_WEIGHT: Partial<Record<BodyId, number>> = {
  sun: 1.3,
  moon: 1.3,
  asc: 1.3,
  mc: 1.25,
  mercury: 1.15,
  venus: 1.15,
  mars: 1.15,
};

function natureOf(a: TransitAspect): Nature {
  const n = ASPECTS[a.type].nature;
  return n === 'harmonious' || n === 'tense' ? n : 'neutral';
}

function weightOf(a: TransitAspect): number {
  return a.strength * (TRANSIT_WEIGHT[a.transitBody] ?? 1) * (NATAL_WEIGHT[a.natalBody] ?? 1);
}

function voiceOf(a: TransitAspect): Voice | null {
  return VOICE[a.transitBody]?.[natureOf(a)] ?? null;
}

/** "Transit Satürn → natal Ay (Kare)" */
function sourceLabel(a: TransitAspect, bodyName: (id: BodyId) => string): string {
  return `Transit ${bodyName(a.transitBody)} → natal ${bodyName(a.natalBody)} · ${ASPECTS[a.type].name}`;
}

function itemFrom(a: TransitAspect, kind: 'strength' | 'caution', bodyName: (id: BodyId) => string): BriefItem | null {
  const voice = voiceOf(a);
  const area = AREA[a.natalBody];
  if (!voice || !area) return null;
  const house = HOUSE_NAMES[a.transitHouse - 1];
  const lead = kind === 'strength' ? `${area} bugün destek alıyor.` : `${area} bugün zorlanabilir.`;
  const where = house ? ` Etki en çok ${a.transitHouse}. ev (${house}) konularında hissedilir.` : '';
  return { title: voice.title, text: lead + where, source: sourceLabel(a, bodyName) };
}

/**
 * Enerji seviyesi: uyumlu ve zorlayıcı açıların ağırlıklı dengesi.
 * 50 nötr; hiç açı yoksa 50 döner.
 */
export function energyLevel(aspects: TransitAspect[]): number {
  let pos = 0;
  let neg = 0;
  for (const a of aspects) {
    const w = weightOf(a);
    const n = natureOf(a);
    if (n === 'harmonious') pos += w;
    else if (n === 'tense') neg += w;
    else pos += w * 0.35; // kavuşum: yönü açı değil, gezegen belirler
  }
  const total = pos + neg;
  if (total === 0) return 50;
  const raw = 50 + 45 * ((pos - neg) / total);
  return Math.round(Math.max(12, Math.min(98, raw)));
}

/**
 * Günün özetini üretir. Aynı rapor için her zaman aynı sonucu döndürür —
 * rastgelelik yoktur, metin o günün en belirleyici transitlerinden seçilir.
 */
export function buildDailyBrief(report: TransitReport, bodyName: (id: BodyId) => string): DailyBrief {
  // Metin tablosunda karşılığı olan açılar, ağırlığa göre sıralı
  const ranked = report.aspects
    .filter((a) => voiceOf(a) !== null && AREA[a.natalBody] !== undefined)
    .map((a) => ({ a, w: weightOf(a) }))
    .sort((x, y) => y.w - x.w || x.a.transitBody.localeCompare(y.a.transitBody));

  const top = ranked[0]?.a;
  const pulse = top ? voiceOf(top)!.pulse : 'Bugün gökyüzü sakin. Kendi ritmini kurmak için iyi bir gün.';
  const pulseSource = top ? sourceLabel(top, bodyName) : 'Bugün natal haritanla dar açı yok';

  /**
   * Liste çeşitli kalsın diye hem transit gezegeni hem de dokunulan natal
   * nokta bir kez kullanılır. Natal nokta tekrar ederse madde metni birebir
   * aynı çıkıyor — yalnızca başlık değişiyor, okuyan hata sanıyor.
   */
  const pick = (want: Nature, limit: number): BriefItem[] => {
    const usedTransit = new Set<BodyId>();
    const usedNatal = new Set<BodyId>();
    const out: BriefItem[] = [];
    for (const { a } of ranked) {
      if (out.length >= limit) break;
      if (natureOf(a) !== want) continue;
      if (usedTransit.has(a.transitBody) || usedNatal.has(a.natalBody)) continue;
      const item = itemFrom(a, want === 'tense' ? 'caution' : 'strength', bodyName);
      if (!item) continue;
      usedTransit.add(a.transitBody);
      usedNatal.add(a.natalBody);
      out.push(item);
    }
    return out;
  };

  const phase = report.moonPhase;
  const moonLine = `Ay ${SIGNS[phase.sign].name} burcunda · ${phase.name} · %${Math.round(phase.illumination * 100)}`;

  return {
    pulse,
    pulseSource,
    strengths: pick('harmonious', 3),
    cautions: pick('tense', 2),
    energy: energyLevel(report.aspects),
    moonLine,
  };
}
