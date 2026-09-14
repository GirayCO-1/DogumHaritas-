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
  /** Nabzı belirleyen transit gezegeni — günün görselini de bu belirler */
  pulseBody: BodyId | null;
  /** Yerel takvim gününün sıra numarası; görsel seçiminde kullanılır */
  day: number;
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
  /**
   * Motivasyon cümleleri. Gün numarasına göre sırayla dönülür: aynı gezegen
   * aynı açıyı birkaç gün üst üste yapsa bile cümle değişir, ama aynı gün
   * her zaman aynı cümleyi verir.
   */
  pulses: string[];
  /** Madde başlığı */
  title: string;
}

/** Yerel takvim gününün sıra numarası — cümle ve görsel seçiminde kullanılır */
export function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/** Transit gezegen × açı doğası → ses */
const VOICE: Partial<Record<BodyId, Record<Nature, Voice>>> = {
  sun: {
    harmonious: {
      pulses: [
        'Bugün kendini göstermek için doğal bir alan açılıyor. Göz önünde olmayı zorlamana gerek yok; yeter ki geri çekilme.',
        'Bugün yaptığın işin görülmesi için fazladan çaba gerekmiyor. Sadece sahiplen.',
        'Bugün kendinden emin olmak için dışarıdan bir işaret bekleme; işaret zaten sende.',
      ],
      title: 'Görünürlük',
    },
    tense: {
      pulses: [
        'Bugün kendini kanıtlama isteği yükselebilir. Onay aramadan da durabildiğini hatırla.',
        'Bugün birine bir şey ispatlamak isteyebilirsin. O listede senin adın var mı, ona bak.',
        'Bugün gurur ile özsaygıyı karıştırmak kolay. İkincisi geri adım atmayı da içerir.',
      ],
      title: 'Kanıtlama baskısı',
    },
    neutral: {
      pulses: [
        'Bugün odak kendine dönüyor. Ne istediğini sessizce netleştirmek için iyi bir gün.',
        'Bugün kimin için yaptığını sormak için iyi bir gün.',
        'Bugün sessiz kalmak, yön kaybetmek değil; yön bulmak da olabilir.',
      ],
      title: 'Kendine dönüş',
    },
  },
  moon: {
    harmonious: {
      pulses: [
        'Bugün içine dönük bir rahatlık var. Hissettiğini bastırmadan taşıyabilirsin.',
        'Bugün kendine iyi gelen küçük şeyi ertelemeyi bırak.',
        'Bugün dinlenmek tembellik değil; yarının enerjisini bugün topluyorsun.',
      ],
      title: 'İç denge',
    },
    tense: {
      pulses: [
        'Duyguların bugün olduğundan büyük görünebilir. Önemli bir karar vermeden önce akşamı bekle.',
        'Bugün bir şey seni olduğundan çok etkileyebilir. Bu, zayıf olduğun anlamına gelmiyor.',
        'Bugün içine kapanma isteği gelirse bir süre izin ver; ama kapıyı kilitleme.',
      ],
      title: 'Duygusal dalgalanma',
    },
    neutral: {
      pulses: [
        'Bugün ruh halin hızlı değişebilir; direnmek yerine akışına bırakmak daha az yorar.',
        'Bugün ne hissettiğini adlandırmak, onu çözmenin yarısı.',
        'Bugün iç sesin yüksek. Onu bastırmak yerine dinlemeyi dene.',
      ],
      title: 'Değişken ruh hali',
    },
  },
  mercury: {
    harmonious: {
      pulses: [
        'Zihnin bugün açık. Uzun süredir ertelediğin o konuşmayı yapmak için iyi bir gün.',
        'Bugün anlatmakta zorlandığın şeyi anlatmak için doğru gün.',
        'Bugün bir soru sormak, bir cevaptan daha çok işine yarayabilir.',
      ],
      title: 'Açık iletişim',
    },
    tense: {
      pulses: [
        'Bugün kelimeler kolay yanlış anlaşılabilir. Göndermeden önce bir kez daha oku.',
        'Bugün tartışmayı kazanmak ile anlaşılmak aynı şey değil. Hangisini istiyorsun?',
        'Bugün acele yazılan mesajın bedeli, yavaş yazılanın süresinden uzun olabilir.',
      ],
      title: 'Yanlış anlaşılma riski',
    },
    neutral: {
      pulses: [
        'Bugün çok şey duyacaksın; hepsini aynı anda yorumlamak zorunda değilsin.',
        'Bugün öğrendiğin şeyi hemen kullanmak zorunda değilsin; bir kenara koy.',
        'Bugün dinlemek, konuşmaktan daha çok şey öğretebilir.',
      ],
      title: 'Yoğun bilgi',
    },
  },
  venus: {
    harmonious: {
      pulses: [
        'Bugün ilişkilerinde yumuşak bir alan var. Değer verdiğin birine bunu söylemek için bekleme.',
        'Bugün bir yakınlık kurmak kolay. İlk adımı atan sen ol.',
        'Bugün güzel bulduğun şeyin yanında biraz daha uzun kal.',
      ],
      title: 'Yumuşak temas',
    },
    tense: {
      pulses: [
        'Bugün beklentiyle gerçek arasındaki fark can sıkabilir. İstediğini açıkça söylemek, ima etmekten kolay.',
        'Bugün birinden bekleyip de söylemediğin şeyi söyle. Beklemek incitiyor.',
        'Bugün "idare eder" dediğin şey aslında etmiyorsa, bunu kendine itiraf et.',
      ],
      title: 'Beklenti farkı',
    },
    neutral: {
      pulses: [
        'Bugün neyi ve kimi gerçekten istediğini fark etmek için iyi bir gün.',
        'Bugün neye evet dediğinden çok, neye hayır dediğin seni anlatıyor.',
        'Bugün küçük bir güzellik peşinde ol; büyük olanı beklemek zorunda değilsin.',
      ],
      title: 'Değerler',
    },
  },
  mars: {
    harmonious: {
      pulses: [
        'Bugün harekete geçmek için enerjin yerinde. Küçük ama gerçek bir adım at.',
        'Bugün ertelediğin işin ilk on dakikasını yap; gerisi arkasından gelir.',
        'Bugün cesaret, korkunun yokluğu değil; yine de başlamak.',
      ],
      title: 'Harekete geçme gücü',
    },
    tense: {
      pulses: [
        'Enerjin yüksek, sabrın dar. Tepki vermeden önce bir nefes al; acele ettiğinde kaybettiğin şey çoğu zaman zaman olmuyor.',
        'Bugün haklı olduğun bir yerde bile sesini yükseltmek işini zorlaştırabilir.',
        'Bugün öfke bir bilgi taşıyor. Önce onu oku, sonra tepki ver.',
      ],
      title: 'Kısa fitil',
    },
    neutral: {
      pulses: [
        'Bugün enerjini bir yere yönlendir; yoksa o enerji seni yönlendirir.',
        'Bugün ne kadar değil, hangi yöne ilerlediğin önemli.',
        'Bugün hız yapmak için değil, doğru yönü seçmek için iyi bir gün.',
      ],
      title: 'Yönlendirilecek enerji',
    },
  },
  jupiter: {
    harmonious: {
      pulses: [
        'Bugün alan genişliyor. Küçük düşünmek için bir sebep yok.',
        'Bugün kendine koyduğun tavanı bir kez daha ölç; sandığından yüksek olabilir.',
        'Bugün bir şeyi istemek, onu hak etmediğin anlamına gelmiyor.',
      ],
      title: 'Genişleyen alan',
    },
    tense: {
      pulses: [
        'Bugün her şey olduğundan büyük görünebilir. Cömertliğin sınırını da senin çizmen gerekiyor.',
        'Bugün "biraz daha" demek kolay. Yeterin nerede olduğunu bilmek senin işin.',
        'Bugün söz vermeden önce takvimine bak.',
      ],
      title: 'Abartma eğilimi',
    },
    neutral: {
      pulses: [
        'Bugün bir kapı aralanabilir; aralık kaldığı sürece acele etmene gerek yok.',
        'Bugün küçük bir merak, uzun bir yolun başlangıcı olabilir.',
        'Bugün öğrenmek için geç kalmış hissedebilirsin; kalmadın.',
      ],
      title: 'Aralanan kapı',
    },
  },
  saturn: {
    harmonious: {
      pulses: [
        'Bugün sabrın karşılığını görebilirsin. Yavaş ilerlemek, geri gitmek değildir.',
        'Bugün uzun süredir yaptığın küçük şeyin toplamına bak.',
        'Bugün disiplin bir ceza değil, kendine verdiğin bir söz.',
      ],
      title: 'Sağlam zemin',
    },
    tense: {
      pulses: [
        'Bugün bir sınırla karşılaşabilirsin. Sınır her zaman engel değildir; bazen sadece yön tarifidir.',
        'Bugün bir kapı kapanabilir. Kapanan her kapı reddedilme değildir.',
        'Bugün yorgunluk varsa, azaltman gereken iş değil belki de beklenti.',
      ],
      title: 'Sınır ve gecikme',
    },
    neutral: {
      pulses: [
        'Bugün küçük ve sürdürülebilir olan, büyük ve parlak olandan daha değerli.',
        'Bugün "yarın başlarım" dediğin şeyin bugünkü en küçük halini yap.',
        'Bugün sabır, hareketsizlik değil; yavaş da olsa devam etmek.',
      ],
      title: 'Sürdürülebilir adım',
    },
  },
  uranus: {
    harmonious: {
      pulses: [
        'Bugün alışkanlığını bozmak iyi gelebilir. Küçük bir şeyi başka türlü dene.',
        'Bugün her zamanki yolundan sapmak sana iyi gelebilir.',
        'Bugün bir fikrin tuhaf gelmesi yanlış olduğu anlamına gelmez.',
      ],
      title: 'Taze bakış',
    },
    tense: {
      pulses: [
        'Bugün plan bozulabilir. Esnek kalmak, haklı çıkmaktan daha işe yarar.',
        'Bugün işler planladığın gibi gitmezse, planı savunmak yerine amacı hatırla.',
        'Bugün ani bir istek gelirse bir gece bekle; yarın hâlâ istiyorsan yap.',
      ],
      title: 'Ani değişim',
    },
    neutral: {
      pulses: [
        'Bugün beklenmedik olan, mutlaka kötü olan değildir.',
        'Bugün alıştığın şey seni rahatlatıyor olabilir, ama ilerletiyor mu?',
        'Bugün küçük bir değişiklik, büyük bir kararı gereksiz kılabilir.',
      ],
      title: 'Beklenmedik',
    },
  },
  neptune: {
    harmonious: {
      pulses: [
        'Bugün sezgin keskin. Açıklayamadığın hislere de kulak ver.',
        'Bugün ilham beklenmedik bir yerden gelebilir; not al.',
        'Bugün kendine hayal kurma izni ver; her şeyin planı olmak zorunda değil.',
      ],
      title: 'Güçlü sezgi',
    },
    tense: {
      pulses: [
        'Bugün sınırlar bulanıklaşabilir. Neyin senin, neyin başkasının olduğunu ayırmak işini kolaylaştırır.',
        'Bugün hayır demek, birini yüzüstü bırakmak değildir.',
        'Bugün gördüğünü sandığın şeyi bir kez daha kontrol et.',
      ],
      title: 'Bulanık sınırlar',
    },
    neutral: {
      pulses: [
        'Bugün her şeyi netleştirmeye çalışma; bazı şeyler kendiliğinden durulur.',
        'Bugün belirsizlik, mutlaka kötü haber değil.',
        'Bugün sessizlik içinde kalmak bazı cevapları kendiliğinden getirir.',
      ],
      title: 'Netleşmeyen',
    },
  },
  pluto: {
    harmonious: {
      pulses: [
        'Bugün bırakman gereken bir şeyi bırakmak sandığından kolay olabilir.',
        'Bugün taşımaktan yorulduğun şeyi bir kenara koy.',
        'Bugün bir şeyin bitmesi, boşa gittiği anlamına gelmez.',
      ],
      title: 'Derin farkındalık',
    },
    tense: {
      pulses: [
        'Bugün kontrol etme isteği yükselebilir. Tutmadığın şey seni daha az yorar.',
        'Bugün her şeyi elinde tutmak istiyorsan, önce neden korktuğuna bak.',
        'Bugün güç mücadelesine girmemek de bir güç gösterisidir.',
      ],
      title: 'Kontrol isteği',
    },
    neutral: {
      pulses: [
        'Bugün yüzeyin altında bir şey hareket ediyor; zorlamadan bakmak yeterli.',
        'Bugün değişimin başladığı yer genelde görünmeyen yer.',
        'Bugün kendine dürüst olmak, başkasına açık olmaktan daha zor olabilir.',
      ],
      title: 'Yüzey altı',
    },
  },
  chiron: {
    harmonious: {
      pulses: [
        'Bugün eski bir yaraya şefkatle bakabilirsin. İyileşmek, unutmak demek değil.',
        'Bugün kendine, en sevdiğin insana konuşur gibi konuş.',
        'Bugün geçmişte yaşadığın şey, bugün birine yol gösterebilir.',
      ],
      title: 'Şefkatli bakış',
    },
    tense: {
      pulses: [
        'Bugün hassas bir yere dokunulabilir. Kendine, bir başkasına davranacağın kadar iyi davran.',
        'Bugün eski bir cümle aklına gelirse, onu söyleyenin haklı olması gerekmiyor.',
        'Bugün kırıldığın yer, aynı zamanda en iyi anladığın yer.',
      ],
      title: 'Hassas nokta',
    },
    neutral: {
      pulses: [
        'Bugün seni zorlayan şey, aynı zamanda başkasına yardım edebildiğin şey olabilir.',
        'Bugün iyileşmek, hiç acımamış gibi davranmak değil.',
        'Bugün yardım istemek, yetersizlik değil; yön değiştirmek.',
      ],
      title: 'Yara ve şifa',
    },
  },
  northNode: {
    harmonious: {
      pulses: [
        'Bugün doğru yönde bir adım atmak kolay. Tanıdık olanı değil, doğru olanı seç.',
        'Bugün alışkanlığın dışına bir adım at; tanıdık olan hep doğru değil.',
        'Bugün seni büyüten şeyi, seni rahatlatan şeye tercih et.',
      ],
      title: 'Doğru yön',
    },
    tense: {
      pulses: [
        'Bugün alışkanlıkla yön arasında bir çekişme var. Konforlu olan hep doğru olan değildir.',
        'Bugün geri dönmek isteyebilirsin. Orada kalmadığın için bir sebep vardı.',
        'Bugün kolay olan ile doğru olan aynı yöne bakmıyor olabilir.',
      ],
      title: 'Alışkanlığa kaçma',
    },
    neutral: {
      pulses: [
        'Bugün küçük bir seçim, uzun vadeli bir yönü belirleyebilir.',
        'Bugün küçük bir "evet" veya "hayır", bir yılı şekillendirebilir.',
        'Bugün nereye gittiğini bilmiyorsan, nereye gitmek istemediğini yaz.',
      ],
      title: 'Yön seçimi',
    },
  },
};

/** Hiç açı yoksa kullanılan cümleler */
const FALLBACK_PULSES = [
  'Bugün gökyüzü sakin. Kendi ritmini kurmak için iyi bir gün.',
  'Bugün haritanda dar bir açı yok; günü sen yazıyorsun.',
  'Bugün dışarıdan gelen bir itki yok. En çok istediğin şeyi hatırlamak için iyi bir gün.',
];

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

  const day = dayNumber(report.date);
  const top = ranked[0]?.a;
  // Aynı transit birkaç gün sürebilir; cümle gün numarasına göre dönüyor ki
  // her sabah aynı şeyi okumayasın.
  const pulses = top ? voiceOf(top)!.pulses : FALLBACK_PULSES;
  const pulse = pulses[((day % pulses.length) + pulses.length) % pulses.length];
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
    pulseBody: top?.transitBody ?? null,
    day,
    strengths: pick('harmonious', 3),
    cautions: pick('tense', 2),
    energy: energyLevel(report.aspects),
    moonLine,
  };
}
