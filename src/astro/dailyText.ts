/**
 * Günün özetinin dile göre metinleri.
 *
 * Yapı her dilde aynı: 12 transit gezegeni × 3 açı doğası, her hücrede
 * gün numarasına göre dönen 3 cümle ve bir madde başlığı. Maddeler cümle
 * kalıbıyla kurulur; kalıplar her dilin dilbilgisine göre ayrı yazılmıştır
 * (İngilizce ve Fransızca'da kalıp cümleyi başlatır, Almanca'da "für"
 * sonrası -i hâli gerekir).
 *
 * Saf TypeScript: React Native'e bağımlı değildir.
 */
import type { Locale } from '@/i18n/locales';

import type { BodyId } from './types';

export type Nature = 'harmonious' | 'tense' | 'neutral';

export interface Voice {
  /** Gün numarasına göre dönen motivasyon cümleleri */
  pulses: readonly string[];
  /** Madde başlığı */
  title: string;
}

export interface DailyText {
  voices: Partial<Record<BodyId, Record<Nature, Voice>>>;
  /** Natal noktanın dokunulan yaşam alanı — cümle kalıbına oturacak biçimde */
  areas: Partial<Record<BodyId, string>>;
  /** Hiç açı yoksa kullanılan cümleler */
  fallbackPulses: readonly string[];
  /** Hiç açı yoksa kaynak satırı */
  noAspect: string;
  strengthLead: (area: string) => string;
  cautionLead: (area: string) => string;
  where: (n: number, house: string) => string;
  source: (t: string, n: string, aspect: string) => string;
  moonLine: (sign: string, phase: string, pct: number) => string;
}

const tr: DailyText = {
  voices: {
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
  },
  areas: {
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
  },
  fallbackPulses: [
    'Bugün gökyüzü sakin. Kendi ritmini kurmak için iyi bir gün.',
    'Bugün haritanda dar bir açı yok; günü sen yazıyorsun.',
    'Bugün dışarıdan gelen bir itki yok. En çok istediğin şeyi hatırlamak için iyi bir gün.',
  ],
  noAspect: 'Bugün natal haritanla dar açı yok',
  strengthLead: (area) => `${area} bugün destek alıyor.`,
  cautionLead: (area) => `${area} bugün zorlanabilir.`,
  where: (n, house) => ` Etki en çok ${n}. ev (${house}) konularında hissedilir.`,
  source: (t, n, aspect) => `Transit ${t} → natal ${n} · ${aspect}`,
  moonLine: (sign, phase, pct) => `Ay ${sign} burcunda · ${phase} · %${pct}`,
};

const en: DailyText = {
  voices: {
    sun: {
      harmonious: {
        pulses: [
          'There is room for you to be seen today. You don\'t have to push for it — just don\'t shrink.',
          'What you\'ve made doesn\'t need extra effort to be noticed today. Just own it.',
          'You don\'t need a sign from outside to feel sure today. The sign is already in you.',
        ],
        title: 'Visibility',
      },
      tense: {
        pulses: [
          'The urge to prove yourself may rise today. Remember you can also stand still without applause.',
          'You may want to prove something to someone today. Check whether your own name is on that list.',
          'Pride and self-respect are easy to confuse today. The second one leaves room for backing down.',
        ],
        title: 'Something to prove',
      },
      neutral: {
        pulses: [
          'The focus turns to you today. A good day to quietly work out what you actually want.',
          'A good day to ask who you\'re really doing it for.',
          'Staying quiet today isn\'t losing your direction; sometimes it\'s how you find it.',
        ],
        title: 'Turning inward',
      },
    },
    moon: {
      harmonious: {
        pulses: [
          'There\'s an inward ease today. You can carry what you feel without pushing it down.',
          'Stop putting off the small thing that does you good.',
          'Resting isn\'t laziness today; you\'re gathering tomorrow\'s energy.',
        ],
        title: 'Inner balance',
      },
      tense: {
        pulses: [
          'Your feelings may look larger than they are today. Sleep on any real decision.',
          'Something may affect you more than it should today. That doesn\'t make you weak.',
          'If you want to withdraw today, allow it for a while — but don\'t lock the door.',
        ],
        title: 'Emotional swell',
      },
      neutral: {
        pulses: [
          'Your mood may change quickly today; going with it costs less than resisting.',
          'Naming what you feel is half of working it out.',
          'Your inner voice is loud today. Try listening instead of muting it.',
        ],
        title: 'Shifting mood',
      },
    },
    mercury: {
      harmonious: {
        pulses: [
          'Your mind is clear today. A good day for the conversation you\'ve been postponing.',
          'Today is the right day to say the thing you struggle to explain.',
          'Asking a question may serve you better than having an answer.',
        ],
        title: 'Clear communication',
      },
      tense: {
        pulses: [
          'Words are easy to misread today. Read it once more before you send it.',
          'Winning the argument and being understood aren\'t the same thing today. Which one do you want?',
          'The cost of a message written in haste can outlast the time it saved.',
        ],
        title: 'Room for misreading',
      },
      neutral: {
        pulses: [
          'You\'ll hear a lot today; you don\'t have to interpret all of it at once.',
          'You don\'t have to use what you learn today right away — set it aside.',
          'Listening may teach you more than speaking today.',
        ],
        title: 'A lot of input',
      },
    },
    venus: {
      harmonious: {
        pulses: [
          'There\'s a softer space in your relationships today. Don\'t wait to tell someone they matter.',
          'Making a connection is easy today. Be the one who moves first.',
          'Stay a little longer next to the thing you find beautiful.',
        ],
        title: 'Soft contact',
      },
      tense: {
        pulses: [
          'The gap between expectation and reality may sting today. Saying what you want is easier than hinting at it.',
          'Say the thing you\'ve been waiting for someone to say. Waiting hurts more.',
          'If what you\'ve been calling "good enough" isn\'t, admit that to yourself today.',
        ],
        title: 'Expectation gap',
      },
      neutral: {
        pulses: [
          'A good day to notice what — and who — you actually want.',
          'What you say no to tells your story more than what you say yes to.',
          'Go after a small beauty today; you don\'t have to wait for the large one.',
        ],
        title: 'Values',
      },
    },
    mars: {
      harmonious: {
        pulses: [
          'Your energy is there for action today. Take one small but real step.',
          'Do the first ten minutes of the thing you\'ve been putting off; the rest follows.',
          'Courage isn\'t the absence of fear today — it\'s starting anyway.',
        ],
        title: 'Drive',
      },
      tense: {
        pulses: [
          'High energy, short patience. Breathe before you react; haste usually costs more than time.',
          'Even where you\'re right today, raising your voice will make it harder.',
          'Anger is carrying information today. Read it first, react second.',
        ],
        title: 'Short fuse',
      },
      neutral: {
        pulses: [
          'Point your energy somewhere today, or it will point you.',
          'It\'s not how far you go today, it\'s which way.',
          'A good day for choosing direction, not for speed.',
        ],
        title: 'Energy to aim',
      },
    },
    jupiter: {
      harmonious: {
        pulses: [
          'The space is widening today. No reason to think small.',
          'Measure the ceiling you set for yourself again; it may be higher than you thought.',
          'Wanting something doesn\'t mean you haven\'t earned it.',
        ],
        title: 'Room to grow',
      },
      tense: {
        pulses: [
          'Everything may look bigger than it is today. The limit of your generosity is yours to draw.',
          '"Just a bit more" is easy to say today. Knowing where your enough is, is your job.',
          'Check your calendar before you promise anything today.',
        ],
        title: 'Overreach',
      },
      neutral: {
        pulses: [
          'A door may open a crack today; while it stays open you don\'t have to rush.',
          'A small curiosity today can be the start of a long road.',
          'You may feel late to learn something today. You aren\'t.',
        ],
        title: 'A door ajar',
      },
    },
    saturn: {
      harmonious: {
        pulses: [
          'Your patience may pay off today. Moving slowly isn\'t moving backwards.',
          'Look at the sum of the small thing you\'ve been doing for a long time.',
          'Discipline isn\'t a punishment today; it\'s a promise you made yourself.',
        ],
        title: 'Solid ground',
      },
      tense: {
        pulses: [
          'You may meet a limit today. A limit isn\'t always a wall; sometimes it\'s just directions.',
          'A door may close today. Not every closed door is a rejection.',
          'If you\'re tired today, maybe it\'s the expectation that needs cutting, not the work.',
        ],
        title: 'Limits and delay',
      },
      neutral: {
        pulses: [
          'Small and sustainable is worth more than large and bright today.',
          'Do the smallest possible version of the thing you said you\'d start tomorrow.',
          'Patience isn\'t stillness today; it\'s continuing, however slowly.',
        ],
        title: 'Sustainable step',
      },
    },
    uranus: {
      harmonious: {
        pulses: [
          'Breaking a habit may do you good today. Try one small thing differently.',
          'Stepping off your usual route may suit you today.',
          'An idea sounding strange doesn\'t make it wrong.',
        ],
        title: 'Fresh view',
      },
      tense: {
        pulses: [
          'Plans may break today. Staying flexible works better than being right.',
          'If things don\'t go to plan today, defend the purpose, not the plan.',
          'If a sudden urge arrives today, sleep on it; if you still want it tomorrow, do it.',
        ],
        title: 'Sudden change',
      },
      neutral: {
        pulses: [
          'What\'s unexpected today isn\'t necessarily what\'s bad.',
          'What you\'re used to may be comforting — but is it moving you?',
          'A small change today can make a big decision unnecessary.',
        ],
        title: 'The unexpected',
      },
    },
    neptune: {
      harmonious: {
        pulses: [
          'Your intuition is sharp today. Listen to the feelings you can\'t explain too.',
          'Inspiration may arrive from somewhere unexpected today; write it down.',
          'Let yourself daydream today; not everything needs a plan.',
        ],
        title: 'Strong intuition',
      },
      tense: {
        pulses: [
          'Boundaries may blur today. Sorting out what\'s yours and what isn\'t makes the day easier.',
          'Saying no today isn\'t abandoning anyone.',
          'Check again what you think you saw today.',
        ],
        title: 'Blurred edges',
      },
      neutral: {
        pulses: [
          'Don\'t try to make everything clear today; some things settle on their own.',
          'Uncertainty isn\'t necessarily bad news today.',
          'Sitting in the quiet today brings some answers by itself.',
        ],
        title: 'Not yet clear',
      },
    },
    pluto: {
      harmonious: {
        pulses: [
          'Letting go of what you need to let go of may be easier than you expect today.',
          'Put down the thing you\'re tired of carrying.',
          'Something ending doesn\'t mean it was wasted.',
        ],
        title: 'Deep clarity',
      },
      tense: {
        pulses: [
          'The urge to control may rise today. What you don\'t hold tires you less.',
          'If you want to keep everything in hand today, look first at what you\'re afraid of.',
          'Not entering a power struggle is also a show of strength.',
        ],
        title: 'Grip',
      },
      neutral: {
        pulses: [
          'Something is moving below the surface today; looking without forcing is enough.',
          'Change usually starts somewhere you can\'t see.',
          'Being honest with yourself may be harder than being open with someone else.',
        ],
        title: 'Below the surface',
      },
    },
    chiron: {
      harmonious: {
        pulses: [
          'You can look at an old wound with kindness today. Healing doesn\'t mean forgetting.',
          'Talk to yourself the way you\'d talk to someone you love.',
          'What you lived through can show someone else the way today.',
        ],
        title: 'A kinder look',
      },
      tense: {
        pulses: [
          'A tender spot may get touched today. Treat yourself as well as you\'d treat someone else.',
          'If an old sentence comes back today, the person who said it didn\'t have to be right.',
          'Where you broke is also where you understand best.',
        ],
        title: 'Tender spot',
      },
      neutral: {
        pulses: [
          'What\'s hard for you may also be what you can help someone else with.',
          'Healing today isn\'t pretending it never hurt.',
          'Asking for help isn\'t inadequacy; it\'s changing direction.',
        ],
        title: 'Wound and repair',
      },
    },
    northNode: {
      harmonious: {
        pulses: [
          'A step in the right direction is easy today. Choose what\'s right, not what\'s familiar.',
          'Take one step outside the habit; familiar isn\'t always correct.',
          'Choose what grows you over what soothes you.',
        ],
        title: 'Right direction',
      },
      tense: {
        pulses: [
          'There\'s a tug between habit and direction today. What\'s comfortable isn\'t always what\'s right.',
          'You may want to go back today. There was a reason you didn\'t stay there.',
          'Easy and right may not be facing the same way today.',
        ],
        title: 'Pull of the familiar',
      },
      neutral: {
        pulses: [
          'A small choice today can shape a long stretch ahead.',
          'One small yes or no can shape a year.',
          'If you don\'t know where you\'re going, write down where you don\'t want to go.',
        ],
        title: 'A choice of direction',
      },
    },
  },
  areas: {
    sun: 'your confidence and how you express yourself',
    moon: 'your feelings and inner world',
    mercury: 'how you think and speak',
    venus: 'your relationships and what you value',
    mars: 'your energy and how you take action',
    jupiter: 'where you grow and expand',
    saturn: 'your responsibilities and boundaries',
    uranus: 'your need for freedom',
    neptune: 'your imagination and intuition',
    pluto: 'where you transform',
    chiron: 'your tender spot',
    northNode: 'your life direction',
    asc: 'the first impression you give',
    mc: 'your career and public standing',
  },
  fallbackPulses: [
    'The sky is quiet today. A good day to set your own rhythm.',
    'No close aspect in your chart today; the day is yours to write.',
    'No push from outside today. A good day to remember what you actually want.',
  ],
  noAspect: 'No close aspect to your natal chart today',
  strengthLead: (area) => `Today supports ${area}.`,
  cautionLead: (area) => `Today puts pressure on ${area}.`,
  where: (n, house) => ` You'll feel it most in house ${n} (${house}).`,
  source: (t, n, aspect) => `Transit ${t} → natal ${n} · ${aspect}`,
  moonLine: (sign, phase, pct) => `Moon in ${sign} · ${phase} · ${pct}%`,
};

const de: DailyText = {
  voices: {
    sun: {
      harmonious: {
        pulses: [
          'Heute ist Raum da, gesehen zu werden. Du musst nichts erzwingen — mach dich nur nicht kleiner.',
          'Was du geschaffen hast, braucht heute keine Extramühe, um aufzufallen. Steh einfach dazu.',
          'Du brauchst heute kein Zeichen von außen, um sicher zu sein. Das Zeichen trägst du längst.',
        ],
        title: 'Sichtbarkeit',
      },
      tense: {
        pulses: [
          'Der Drang, dich zu beweisen, kann heute steigen. Du darfst auch ohne Applaus stehen bleiben.',
          'Vielleicht willst du heute jemandem etwas beweisen. Prüfe, ob dein eigener Name auf der Liste steht.',
          'Stolz und Selbstachtung sind heute leicht zu verwechseln. Das Zweite lässt Platz zum Nachgeben.',
        ],
        title: 'Beweisdruck',
      },
      neutral: {
        pulses: [
          'Der Fokus wendet sich heute dir zu. Ein guter Tag, um still zu klären, was du wirklich willst.',
          'Ein guter Tag für die Frage, für wen du es eigentlich tust.',
          'Heute still zu bleiben heißt nicht, die Richtung zu verlieren — manchmal findet man sie so.',
        ],
        title: 'Blick nach innen',
      },
    },
    moon: {
      harmonious: {
        pulses: [
          'Heute liegt eine Ruhe nach innen. Du kannst tragen, was du fühlst, ohne es wegzudrücken.',
          'Schieb die kleine Sache, die dir guttut, heute nicht weiter auf.',
          'Ausruhen ist heute keine Faulheit; du sammelst die Kraft von morgen.',
        ],
        title: 'Innere Ruhe',
      },
      tense: {
        pulses: [
          'Deine Gefühle können heute größer wirken, als sie sind. Schlaf über wichtige Entscheidungen.',
          'Etwas trifft dich heute vielleicht stärker als nötig. Das macht dich nicht schwach.',
          'Wenn du dich heute zurückziehen willst, erlaub es dir eine Weile — aber schließ nicht ab.',
        ],
        title: 'Gefühlswelle',
      },
      neutral: {
        pulses: [
          'Deine Stimmung kann heute schnell kippen; mitgehen kostet weniger als dagegenhalten.',
          'Zu benennen, was du fühlst, ist die halbe Lösung.',
          'Deine innere Stimme ist heute laut. Hör hin, statt sie stummzuschalten.',
        ],
        title: 'Wechselnde Stimmung',
      },
    },
    mercury: {
      harmonious: {
        pulses: [
          'Dein Kopf ist heute klar. Ein guter Tag für das Gespräch, das du lange aufgeschoben hast.',
          'Heute ist der richtige Tag, das zu sagen, was dir schwerfällt zu erklären.',
          'Eine Frage bringt dich heute vielleicht weiter als eine Antwort.',
        ],
        title: 'Klare Worte',
      },
      tense: {
        pulses: [
          'Worte lassen sich heute leicht falsch verstehen. Lies es noch einmal, bevor du sendest.',
          'Recht behalten und verstanden werden sind heute nicht dasselbe. Was willst du?',
          'Der Preis einer hastigen Nachricht kann die gesparte Zeit überdauern.',
        ],
        title: 'Missverständnisgefahr',
      },
      neutral: {
        pulses: [
          'Du wirst heute viel hören; du musst nicht alles sofort einordnen.',
          'Was du heute lernst, musst du nicht gleich anwenden — leg es beiseite.',
          'Zuhören bringt dir heute mehr bei als Reden.',
        ],
        title: 'Viel Eingang',
      },
    },
    venus: {
      harmonious: {
        pulses: [
          'In deinen Beziehungen ist heute ein weicher Raum. Sag jemandem, dass er dir wichtig ist.',
          'Nähe entsteht heute leicht. Mach du den ersten Schritt.',
          'Bleib heute etwas länger neben dem, was du schön findest.',
        ],
        title: 'Sanfte Nähe',
      },
      tense: {
        pulses: [
          'Der Abstand zwischen Erwartung und Wirklichkeit kann heute wehtun. Sag, was du willst — Andeuten ist schwerer.',
          'Sag das, worauf du von jemandem wartest. Warten tut mehr weh.',
          'Wenn dein "geht schon" heute nicht mehr geht, gib es dir selbst zu.',
        ],
        title: 'Erwartungslücke',
      },
      neutral: {
        pulses: [
          'Ein guter Tag, um zu merken, was — und wen — du wirklich willst.',
          'Wozu du Nein sagst, erzählt mehr über dich als dein Ja.',
          'Such heute eine kleine Schönheit; du musst nicht auf die große warten.',
        ],
        title: 'Werte',
      },
    },
    mars: {
      harmonious: {
        pulses: [
          'Deine Energie ist heute da. Mach einen kleinen, aber echten Schritt.',
          'Mach die ersten zehn Minuten der Sache, die du aufschiebst; der Rest kommt nach.',
          'Mut ist heute nicht die Abwesenheit von Angst — sondern trotzdem anzufangen.',
        ],
        title: 'Antrieb',
      },
      tense: {
        pulses: [
          'Viel Energie, wenig Geduld. Atme, bevor du reagierst; Eile kostet meist mehr als Zeit.',
          'Selbst wo du heute recht hast, macht lauter werden es schwerer.',
          'Wut trägt heute eine Information. Lies sie erst, reagiere dann.',
        ],
        title: 'Kurze Zündschnur',
      },
      neutral: {
        pulses: [
          'Gib deiner Energie heute ein Ziel, sonst gibt sie dir eins.',
          'Heute zählt nicht wie weit, sondern wohin.',
          'Ein guter Tag, um die Richtung zu wählen, nicht das Tempo.',
        ],
        title: 'Energie mit Richtung',
      },
    },
    jupiter: {
      harmonious: {
        pulses: [
          'Der Raum wird heute größer. Es gibt keinen Grund, klein zu denken.',
          'Miss die Decke, die du dir gesetzt hast, noch einmal; sie hängt vielleicht höher.',
          'Etwas zu wollen heißt nicht, dass du es nicht verdient hättest.',
        ],
        title: 'Weiter Raum',
      },
      tense: {
        pulses: [
          'Heute wirkt alles größer, als es ist. Die Grenze deiner Großzügigkeit ziehst du selbst.',
          '"Nur noch ein bisschen" ist heute schnell gesagt. Zu wissen, wo dein Genug liegt, ist deine Aufgabe.',
          'Schau heute in den Kalender, bevor du etwas zusagst.',
        ],
        title: 'Neigung zum Zuviel',
      },
      neutral: {
        pulses: [
          'Heute geht vielleicht eine Tür auf; solange sie offen bleibt, musst du nicht hetzen.',
          'Eine kleine Neugier kann heute der Anfang eines langen Weges sein.',
          'Du fühlst dich heute vielleicht zu spät dran, etwas zu lernen. Bist du nicht.',
        ],
        title: 'Eine offene Tür',
      },
    },
    saturn: {
      harmonious: {
        pulses: [
          'Deine Geduld kann sich heute auszahlen. Langsam gehen ist nicht rückwärts gehen.',
          'Schau auf die Summe der kleinen Sache, die du lange tust.',
          'Disziplin ist heute keine Strafe, sondern ein Versprechen an dich selbst.',
        ],
        title: 'Fester Boden',
      },
      tense: {
        pulses: [
          'Heute triffst du vielleicht auf eine Grenze. Eine Grenze ist nicht immer eine Wand, manchmal nur ein Wegweiser.',
          'Heute schließt sich vielleicht eine Tür. Nicht jede geschlossene Tür ist eine Absage.',
          'Wenn du heute müde bist, muss vielleicht die Erwartung kleiner werden, nicht die Arbeit.',
        ],
        title: 'Grenze und Verzögerung',
      },
      neutral: {
        pulses: [
          'Klein und tragfähig ist heute mehr wert als groß und glänzend.',
          'Mach heute die kleinste Version dessen, was du "morgen" anfangen wolltest.',
          'Geduld ist heute kein Stillstand, sondern Weitergehen, wenn auch langsam.',
        ],
        title: 'Tragfähiger Schritt',
      },
    },
    uranus: {
      harmonious: {
        pulses: [
          'Eine Gewohnheit zu brechen kann heute guttun. Mach eine Kleinigkeit anders.',
          'Von deinem üblichen Weg abzuweichen passt heute gut.',
          'Dass eine Idee seltsam klingt, macht sie nicht falsch.',
        ],
        title: 'Frischer Blick',
      },
      tense: {
        pulses: [
          'Pläne können heute kippen. Beweglich bleiben hilft mehr als recht behalten.',
          'Wenn es heute anders läuft, verteidige den Zweck, nicht den Plan.',
          'Kommt heute ein plötzlicher Impuls, schlaf darüber; willst du es morgen noch, tu es.',
        ],
        title: 'Plötzliche Wendung',
      },
      neutral: {
        pulses: [
          'Was heute unerwartet ist, ist nicht zwangsläufig schlecht.',
          'Das Vertraute beruhigt dich vielleicht — aber bringt es dich weiter?',
          'Eine kleine Änderung kann heute eine große Entscheidung überflüssig machen.',
        ],
        title: 'Das Unerwartete',
      },
    },
    neptune: {
      harmonious: {
        pulses: [
          'Deine Intuition ist heute wach. Hör auch auf das, was du nicht erklären kannst.',
          'Inspiration kommt heute vielleicht von unerwarteter Seite; schreib sie auf.',
          'Erlaub dir heute zu träumen; nicht alles braucht einen Plan.',
        ],
        title: 'Feine Intuition',
      },
      tense: {
        pulses: [
          'Grenzen können heute verschwimmen. Zu trennen, was deins ist und was nicht, macht den Tag leichter.',
          'Heute Nein zu sagen heißt nicht, jemanden im Stich zu lassen.',
          'Prüfe heute noch einmal, was du gesehen zu haben glaubst.',
        ],
        title: 'Verschwimmende Grenzen',
      },
      neutral: {
        pulses: [
          'Versuch heute nicht, alles klarzukriegen; manches klärt sich von selbst.',
          'Ungewissheit ist heute nicht unbedingt eine schlechte Nachricht.',
          'In der Stille zu bleiben bringt heute manche Antwort von allein.',
        ],
        title: 'Noch unklar',
      },
    },
    pluto: {
      harmonious: {
        pulses: [
          'Loszulassen, was du loslassen solltest, ist heute leichter als gedacht.',
          'Leg das ab, was dich vom Tragen müde macht.',
          'Dass etwas endet, heißt nicht, dass es umsonst war.',
        ],
        title: 'Tiefe Klarheit',
      },
      tense: {
        pulses: [
          'Der Drang zu kontrollieren kann heute steigen. Was du nicht festhältst, ermüdet dich weniger.',
          'Wenn du heute alles in der Hand behalten willst, schau zuerst, wovor du Angst hast.',
          'Sich nicht auf einen Machtkampf einzulassen, ist auch eine Kraftdemonstration.',
        ],
        title: 'Kontrollbedürfnis',
      },
      neutral: {
        pulses: [
          'Unter der Oberfläche bewegt sich heute etwas; hinsehen genügt, drängen nicht.',
          'Veränderung beginnt meist dort, wo man sie nicht sieht.',
          'Ehrlich zu dir selbst zu sein ist heute vielleicht schwerer als offen zu anderen.',
        ],
        title: 'Unter der Oberfläche',
      },
    },
    chiron: {
      harmonious: {
        pulses: [
          'Du kannst heute mit Milde auf eine alte Wunde schauen. Heilen heißt nicht vergessen.',
          'Sprich heute mit dir, wie du mit einem lieben Menschen sprichst.',
          'Was du erlebt hast, kann heute jemandem den Weg zeigen.',
        ],
        title: 'Milder Blick',
      },
      tense: {
        pulses: [
          'Ein wunder Punkt kann heute berührt werden. Behandle dich so gut, wie du andere behandelst.',
          'Wenn dir heute ein alter Satz einfällt: Wer ihn gesagt hat, musste nicht recht haben.',
          'Wo du gebrochen bist, verstehst du auch am besten.',
        ],
        title: 'Wunder Punkt',
      },
      neutral: {
        pulses: [
          'Was dich fordert, ist vielleicht genau das, womit du anderen helfen kannst.',
          'Heilen heißt heute nicht, so zu tun, als hätte es nie wehgetan.',
          'Um Hilfe zu bitten ist kein Mangel, sondern ein Richtungswechsel.',
        ],
        title: 'Wunde und Heilung',
      },
    },
    northNode: {
      harmonious: {
        pulses: [
          'Ein Schritt in die richtige Richtung fällt heute leicht. Wähl das Richtige, nicht das Vertraute.',
          'Geh heute einen Schritt aus der Gewohnheit heraus; vertraut ist nicht immer richtig.',
          'Wähl, was dich wachsen lässt, vor dem, was dich beruhigt.',
        ],
        title: 'Richtige Richtung',
      },
      tense: {
        pulses: [
          'Heute zieht es zwischen Gewohnheit und Richtung. Bequem ist nicht immer richtig.',
          'Du willst heute vielleicht zurück. Es gab einen Grund, warum du dort nicht geblieben bist.',
          'Leicht und richtig schauen heute vielleicht nicht in dieselbe Richtung.',
        ],
        title: 'Rückzug ins Gewohnte',
      },
      neutral: {
        pulses: [
          'Eine kleine Wahl heute kann eine lange Strecke prägen.',
          'Ein kleines Ja oder Nein kann ein Jahr formen.',
          'Wenn du nicht weißt, wohin du willst, schreib auf, wohin du nicht willst.',
        ],
        title: 'Richtungswahl',
      },
    },
  },
  areas: {
    sun: 'dein Selbstvertrauen und deine Art, dich zu zeigen',
    moon: 'deine Gefühle und deine Innenwelt',
    mercury: 'dein Denken und Sprechen',
    venus: 'deine Beziehungen und das, was dir wertvoll ist',
    mars: 'deine Energie und deine Art zu handeln',
    jupiter: 'dein Wachstum',
    saturn: 'deine Verantwortung und deine Grenzen',
    uranus: 'dein Freiheitsbedürfnis',
    neptune: 'deine Vorstellungskraft und Intuition',
    pluto: 'deine Wandlung',
    chiron: 'deinen wunden Punkt',
    northNode: 'deine Lebensrichtung',
    asc: 'den ersten Eindruck, den du machst',
    mc: 'deinen Beruf und deine Stellung',
  },
  fallbackPulses: [
    'Der Himmel ist heute ruhig. Ein guter Tag, deinen eigenen Rhythmus zu finden.',
    'Heute kein enger Aspekt in deinem Horoskop; den Tag schreibst du selbst.',
    'Heute kommt kein Anstoß von außen. Ein guter Tag, dich zu erinnern, was du wirklich willst.',
  ],
  noAspect: 'Heute kein enger Aspekt zu deinem Radix',
  strengthLead: (area) => `Heute gibt es Rückenwind für ${area}.`,
  cautionLead: (area) => `Heute gibt es Gegenwind für ${area}.`,
  where: (n, house) => ` Am stärksten spürst du es im ${n}. Haus (${house}).`,
  source: (t, n, aspect) => `Transit-${t} → Radix-${n} · ${aspect}`,
  moonLine: (sign, phase, pct) => `Mond in ${sign} · ${phase} · ${pct}%`,
};

const fr: DailyText = {
  voices: {
    sun: {
      harmonious: {
        pulses: [
          'Il y a de la place pour être vu aujourd\'hui. Pas besoin de forcer — simplement, ne te fais pas petit.',
          'Ce que tu as fait n\'a pas besoin d\'effort supplémentaire pour être remarqué. Assume-le, c\'est tout.',
          'Tu n\'as pas besoin d\'un signe extérieur pour être sûr aujourd\'hui. Le signe est déjà en toi.',
        ],
        title: 'Visibilité',
      },
      tense: {
        pulses: [
          'L\'envie de te prouver peut monter aujourd\'hui. Rappelle-toi que tu peux aussi rester là sans applaudissements.',
          'Tu voudras peut-être prouver quelque chose à quelqu\'un aujourd\'hui. Vérifie si ton nom figure sur cette liste.',
          'L\'orgueil et l\'estime de soi se confondent facilement aujourd\'hui. Le second laisse la place au recul.',
        ],
        title: 'Besoin de prouver',
      },
      neutral: {
        pulses: [
          'L\'attention revient vers toi aujourd\'hui. Bon jour pour clarifier en silence ce que tu veux vraiment.',
          'Bon jour pour te demander pour qui tu le fais réellement.',
          'Se taire aujourd\'hui, ce n\'est pas perdre sa direction ; parfois c\'est la trouver.',
        ],
        title: 'Retour à soi',
      },
    },
    moon: {
      harmonious: {
        pulses: [
          'Il y a une douceur vers l\'intérieur aujourd\'hui. Tu peux porter ce que tu ressens sans l\'étouffer.',
          'Arrête de repousser la petite chose qui te fait du bien.',
          'Se reposer n\'est pas de la paresse aujourd\'hui ; tu rassembles l\'énergie de demain.',
        ],
        title: 'Équilibre intérieur',
      },
      tense: {
        pulses: [
          'Tes émotions peuvent paraître plus grandes qu\'elles ne sont. Attends demain pour toute décision importante.',
          'Quelque chose peut te toucher plus qu\'il ne faudrait aujourd\'hui. Cela ne te rend pas faible.',
          'Si tu veux te replier aujourd\'hui, accorde-le-toi un moment — mais ne verrouille pas la porte.',
        ],
        title: 'Vague émotionnelle',
      },
      neutral: {
        pulses: [
          'Ton humeur peut changer vite aujourd\'hui ; suivre le courant coûte moins que résister.',
          'Nommer ce que tu ressens, c\'est déjà la moitié du chemin.',
          'Ta voix intérieure est forte aujourd\'hui. Essaie de l\'écouter plutôt que de la couvrir.',
        ],
        title: 'Humeur changeante',
      },
    },
    mercury: {
      harmonious: {
        pulses: [
          'Ton esprit est clair aujourd\'hui. Bon jour pour la conversation que tu repousses depuis longtemps.',
          'C\'est le bon jour pour dire ce que tu as du mal à expliquer.',
          'Poser une question peut t\'être plus utile qu\'avoir une réponse.',
        ],
        title: 'Parole claire',
      },
      tense: {
        pulses: [
          'Les mots se comprennent de travers aujourd\'hui. Relis avant d\'envoyer.',
          'Gagner la discussion et être compris ne sont pas la même chose. Lequel veux-tu ?',
          'Le prix d\'un message écrit à la hâte peut durer plus longtemps que le temps gagné.',
        ],
        title: 'Risque de malentendu',
      },
      neutral: {
        pulses: [
          'Tu entendras beaucoup aujourd\'hui ; tu n\'es pas obligé de tout interpréter d\'un coup.',
          'Ce que tu apprends aujourd\'hui n\'a pas à servir tout de suite — mets-le de côté.',
          'Écouter peut t\'apprendre plus que parler aujourd\'hui.',
        ],
        title: 'Beaucoup d\'informations',
      },
    },
    venus: {
      harmonious: {
        pulses: [
          'Il y a un espace plus doux dans tes relations aujourd\'hui. N\'attends pas pour dire à quelqu\'un qu\'il compte.',
          'Créer un lien est facile aujourd\'hui. Fais le premier pas.',
          'Reste un peu plus longtemps près de ce que tu trouves beau.',
        ],
        title: 'Contact doux',
      },
      tense: {
        pulses: [
          'L\'écart entre l\'attente et le réel peut piquer aujourd\'hui. Dire ce que tu veux est plus simple que le sous-entendre.',
          'Dis ce que tu attends que quelqu\'un dise. Attendre fait plus mal.',
          'Si ton « ça va » n\'en est plus un aujourd\'hui, admets-le au moins pour toi.',
        ],
        title: 'Écart d\'attente',
      },
      neutral: {
        pulses: [
          'Bon jour pour remarquer ce que — et qui — tu veux vraiment.',
          'Ce à quoi tu dis non te raconte mieux que ce à quoi tu dis oui.',
          'Cherche une petite beauté aujourd\'hui ; tu n\'as pas à attendre la grande.',
        ],
        title: 'Valeurs',
      },
    },
    mars: {
      harmonious: {
        pulses: [
          'Ton énergie est au rendez-vous aujourd\'hui. Fais un pas petit mais réel.',
          'Fais les dix premières minutes de ce que tu repousses ; le reste suit.',
          'Le courage n\'est pas l\'absence de peur aujourd\'hui — c\'est commencer quand même.',
        ],
        title: 'Élan',
      },
      tense: {
        pulses: [
          'Beaucoup d\'énergie, peu de patience. Respire avant de réagir ; la hâte coûte souvent plus que du temps.',
          'Même là où tu as raison aujourd\'hui, hausser le ton compliquera les choses.',
          'La colère porte une information aujourd\'hui. Lis-la d\'abord, réagis ensuite.',
        ],
        title: 'Mèche courte',
      },
      neutral: {
        pulses: [
          'Oriente ton énergie aujourd\'hui, sinon c\'est elle qui t\'orientera.',
          'Aujourd\'hui, ce n\'est pas jusqu\'où mais dans quelle direction.',
          'Bon jour pour choisir la direction, pas la vitesse.',
        ],
        title: 'Énergie à orienter',
      },
    },
    jupiter: {
      harmonious: {
        pulses: [
          'L\'espace s\'élargit aujourd\'hui. Aucune raison de penser petit.',
          'Remesure le plafond que tu t\'es fixé ; il est peut-être plus haut que tu ne crois.',
          'Vouloir quelque chose ne veut pas dire que tu ne le mérites pas.',
        ],
        title: 'Espace qui s\'ouvre',
      },
      tense: {
        pulses: [
          'Tout peut paraître plus grand qu\'il ne l\'est aujourd\'hui. La limite de ta générosité, c\'est à toi de la tracer.',
          '« Encore un peu » se dit vite aujourd\'hui. Savoir où est ton assez, c\'est ton travail.',
          'Regarde ton agenda avant de promettre quoi que ce soit aujourd\'hui.',
        ],
        title: 'Tendance à l\'excès',
      },
      neutral: {
        pulses: [
          'Une porte peut s\'entrouvrir aujourd\'hui ; tant qu\'elle reste ouverte, rien ne presse.',
          'Une petite curiosité aujourd\'hui peut être le début d\'un long chemin.',
          'Tu te sens peut-être en retard pour apprendre quelque chose. Tu ne l\'es pas.',
        ],
        title: 'Une porte entrouverte',
      },
    },
    saturn: {
      harmonious: {
        pulses: [
          'Ta patience peut payer aujourd\'hui. Avancer lentement, ce n\'est pas reculer.',
          'Regarde la somme de la petite chose que tu fais depuis longtemps.',
          'La discipline n\'est pas une punition aujourd\'hui ; c\'est une promesse que tu t\'es faite.',
        ],
        title: 'Terrain solide',
      },
      tense: {
        pulses: [
          'Tu peux rencontrer une limite aujourd\'hui. Une limite n\'est pas toujours un mur ; parfois c\'est juste une indication.',
          'Une porte peut se fermer aujourd\'hui. Toute porte fermée n\'est pas un refus.',
          'Si tu es fatigué aujourd\'hui, c\'est peut-être l\'attente qu\'il faut réduire, pas le travail.',
        ],
        title: 'Limite et retard',
      },
      neutral: {
        pulses: [
          'Petit et tenable vaut plus aujourd\'hui que grand et brillant.',
          'Fais la plus petite version possible de ce que tu comptais commencer « demain ».',
          'La patience n\'est pas l\'immobilité aujourd\'hui ; c\'est continuer, même lentement.',
        ],
        title: 'Pas tenable',
      },
    },
    uranus: {
      harmonious: {
        pulses: [
          'Casser une habitude peut te faire du bien aujourd\'hui. Fais une petite chose autrement.',
          'Sortir de ton itinéraire habituel te convient aujourd\'hui.',
          'Qu\'une idée sonne étrange ne la rend pas fausse.',
        ],
        title: 'Regard neuf',
      },
      tense: {
        pulses: [
          'Les plans peuvent se défaire aujourd\'hui. Rester souple sert plus qu\'avoir raison.',
          'Si ça ne se passe pas comme prévu aujourd\'hui, défends l\'objectif, pas le plan.',
          'Si une envie soudaine arrive aujourd\'hui, dors dessus ; si tu la veux encore demain, fais-le.',
        ],
        title: 'Changement soudain',
      },
      neutral: {
        pulses: [
          'Ce qui est imprévu aujourd\'hui n\'est pas forcément mauvais.',
          'Ce à quoi tu es habitué te rassure peut-être — mais est-ce que ça te fait avancer ?',
          'Un petit changement aujourd\'hui peut rendre une grande décision inutile.',
        ],
        title: 'L\'imprévu',
      },
    },
    neptune: {
      harmonious: {
        pulses: [
          'Ton intuition est vive aujourd\'hui. Écoute aussi ce que tu ne sais pas expliquer.',
          'L\'inspiration peut venir d\'un endroit inattendu aujourd\'hui ; note-la.',
          'Autorise-toi à rêver aujourd\'hui ; tout n\'a pas besoin d\'un plan.',
        ],
        title: 'Intuition fine',
      },
      tense: {
        pulses: [
          'Les limites peuvent se brouiller aujourd\'hui. Distinguer ce qui est à toi de ce qui ne l\'est pas allège la journée.',
          'Dire non aujourd\'hui, ce n\'est abandonner personne.',
          'Vérifie encore une fois ce que tu crois avoir vu aujourd\'hui.',
        ],
        title: 'Limites floues',
      },
      neutral: {
        pulses: [
          'N\'essaie pas de tout clarifier aujourd\'hui ; certaines choses se déposent seules.',
          'L\'incertitude n\'est pas forcément une mauvaise nouvelle aujourd\'hui.',
          'Rester dans le silence apporte aujourd\'hui certaines réponses d\'elles-mêmes.',
        ],
        title: 'Pas encore net',
      },
    },
    pluto: {
      harmonious: {
        pulses: [
          'Lâcher ce que tu dois lâcher peut être plus simple que prévu aujourd\'hui.',
          'Pose ce que tu es fatigué de porter.',
          'Qu\'une chose se termine ne veut pas dire qu\'elle était vaine.',
        ],
        title: 'Clarté profonde',
      },
      tense: {
        pulses: [
          'L\'envie de contrôler peut monter aujourd\'hui. Ce que tu ne retiens pas te fatigue moins.',
          'Si tu veux tout garder en main aujourd\'hui, regarde d\'abord ce qui te fait peur.',
          'Ne pas entrer dans un rapport de force est aussi une démonstration de force.',
        ],
        title: 'Besoin de contrôle',
      },
      neutral: {
        pulses: [
          'Quelque chose bouge sous la surface aujourd\'hui ; regarder suffit, forcer non.',
          'Le changement commence souvent là où on ne le voit pas.',
          'Être honnête avec toi peut être plus dur aujourd\'hui qu\'être ouvert avec un autre.',
        ],
        title: 'Sous la surface',
      },
    },
    chiron: {
      harmonious: {
        pulses: [
          'Tu peux regarder une vieille blessure avec douceur aujourd\'hui. Guérir ne veut pas dire oublier.',
          'Parle-toi aujourd\'hui comme tu parlerais à quelqu\'un que tu aimes.',
          'Ce que tu as traversé peut montrer le chemin à quelqu\'un aujourd\'hui.',
        ],
        title: 'Regard bienveillant',
      },
      tense: {
        pulses: [
          'Un point sensible peut être touché aujourd\'hui. Traite-toi aussi bien que tu traites les autres.',
          'Si une vieille phrase te revient aujourd\'hui, celui qui l\'a dite n\'avait pas forcément raison.',
          'Là où tu t\'es brisé est aussi là où tu comprends le mieux.',
        ],
        title: 'Point sensible',
      },
      neutral: {
        pulses: [
          'Ce qui te met à l\'épreuve est peut-être ce avec quoi tu peux aider quelqu\'un.',
          'Guérir aujourd\'hui, ce n\'est pas faire comme si ça n\'avait jamais fait mal.',
          'Demander de l\'aide n\'est pas une insuffisance ; c\'est un changement de direction.',
        ],
        title: 'Blessure et soin',
      },
    },
    northNode: {
      harmonious: {
        pulses: [
          'Un pas dans la bonne direction est facile aujourd\'hui. Choisis le juste, pas le familier.',
          'Fais un pas hors de l\'habitude ; familier n\'est pas toujours juste.',
          'Choisis ce qui te fait grandir plutôt que ce qui te rassure.',
        ],
        title: 'Bonne direction',
      },
      tense: {
        pulses: [
          'Il y a un tiraillement entre l\'habitude et la direction aujourd\'hui. Le confortable n\'est pas toujours le juste.',
          'Tu voudras peut-être revenir en arrière aujourd\'hui. Il y avait une raison pour que tu n\'y restes pas.',
          'Le facile et le juste ne regardent peut-être pas dans la même direction aujourd\'hui.',
        ],
        title: 'Repli sur l\'habitude',
      },
      neutral: {
        pulses: [
          'Un petit choix aujourd\'hui peut façonner une longue étape.',
          'Un petit oui ou non peut façonner une année.',
          'Si tu ne sais pas où tu vas, écris où tu ne veux pas aller.',
        ],
        title: 'Choix de direction',
      },
    },
  },
  areas: {
    sun: 'ta confiance et ta façon de t\'exprimer',
    moon: 'tes émotions et ton monde intérieur',
    mercury: 'ta façon de penser et de parler',
    venus: 'tes relations et ce à quoi tu tiens',
    mars: 'ton énergie et ta façon d\'agir',
    jupiter: 'là où tu grandis et t\'élargis',
    saturn: 'tes responsabilités et tes limites',
    uranus: 'ton besoin de liberté',
    neptune: 'ton imagination et ton intuition',
    pluto: 'là où tu te transformes',
    chiron: 'ton point sensible',
    northNode: 'ta direction de vie',
    asc: 'la première impression que tu donnes',
    mc: 'ta carrière et ton statut social',
  },
  fallbackPulses: [
    'Le ciel est calme aujourd\'hui. Bon jour pour installer ton propre rythme.',
    'Aucun aspect serré dans ton thème aujourd\'hui ; la journée, c\'est toi qui l\'écris.',
    'Aucune impulsion extérieure aujourd\'hui. Bon jour pour te rappeler ce que tu veux vraiment.',
  ],
  noAspect: "Aucun aspect serré à ton thème natal aujourd'hui",
  strengthLead: (area) => `Aujourd'hui apporte du soutien à ${area}.`,
  cautionLead: (area) => `Aujourd'hui met à l'épreuve ${area}.`,
  where: (n, house) => ` C'est en maison ${n} (${house}) que cela se ressent le plus.`,
  source: (t, n, aspect) => `${t} en transit → ${n} natal · ${aspect}`,
  moonLine: (sign, phase, pct) => `Lune en ${sign} · ${phase} · ${pct}%`,
};

const ar: DailyText = {
  voices: {
    sun: {
      harmonious: {
        pulses: [
          'هناك مساحة لأن تُرى اليوم. لا حاجة لأن تجبر شيئًا — فقط لا تصغّر نفسك.',
          'ما صنعته لا يحتاج جهدًا إضافيًا ليُلاحظ اليوم. تبنَّه فحسب.',
          'لا تحتاج إشارة من الخارج لتطمئن اليوم. الإشارة فيك أصلًا.',
        ],
        title: 'الظهور',
      },
      tense: {
        pulses: [
          'قد ترتفع اليوم الرغبة في إثبات نفسك. تذكّر أنك تستطيع الوقوف دون تصفيق.',
          'قد ترغب اليوم في إثبات شيء لأحدهم. تحقّق إن كان اسمك على تلك القائمة.',
          'الكبرياء واحترام الذات يختلطان بسهولة اليوم. الثاني يترك مكانًا للتراجع.',
        ],
        title: 'ضغط الإثبات',
      },
      neutral: {
        pulses: [
          'ينعطف التركيز نحوك اليوم. يوم جيد لتوضّح بهدوء ما تريده فعلًا.',
          'يوم جيد لتسأل: لمن تفعل هذا حقًا؟',
          'الصمت اليوم ليس فقدانًا للاتجاه؛ أحيانًا هو طريقة إيجاده.',
        ],
        title: 'العودة إلى الذات',
      },
    },
    moon: {
      harmonious: {
        pulses: [
          'هناك راحة تتّجه إلى الداخل اليوم. تستطيع حمل ما تشعر به دون كبته.',
          'توقّف عن تأجيل الشيء الصغير الذي يريحك.',
          'الراحة اليوم ليست كسلًا؛ أنت تجمع طاقة الغد.',
        ],
        title: 'توازن داخلي',
      },
      tense: {
        pulses: [
          'قد تبدو مشاعرك أكبر مما هي اليوم. أجّل أي قرار مهم إلى الغد.',
          'قد يؤثر فيك شيء أكثر مما ينبغي اليوم. هذا لا يجعلك ضعيفًا.',
          'إن أردت الانسحاب اليوم فاسمح لنفسك قليلًا — لكن لا تُغلق الباب.',
        ],
        title: 'موجة شعورية',
      },
      neutral: {
        pulses: [
          'قد يتبدّل مزاجك سريعًا اليوم؛ المسايرة أقل كلفة من المقاومة.',
          'أن تسمّي ما تشعر به هو نصف الحل.',
          'صوتك الداخلي عالٍ اليوم. جرّب الإصغاء بدل إسكاته.',
        ],
        title: 'مزاج متقلّب',
      },
    },
    mercury: {
      harmonious: {
        pulses: [
          'ذهنك صافٍ اليوم. يوم جيد للحديث الذي طالما أجّلته.',
          'اليوم هو اليوم المناسب لقول ما يصعب عليك شرحه.',
          'قد يفيدك طرح سؤال أكثر من امتلاك جواب.',
        ],
        title: 'تواصل صافٍ',
      },
      tense: {
        pulses: [
          'تُساء قراءة الكلمات بسهولة اليوم. اقرأ رسالتك مرة أخرى قبل إرسالها.',
          'كسب النقاش وأن تُفهم ليسا الشيء نفسه اليوم. أيهما تريد؟',
          'ثمن رسالة كُتبت على عجل قد يدوم أطول من الوقت الذي وفّرته.',
        ],
        title: 'احتمال سوء الفهم',
      },
      neutral: {
        pulses: [
          'ستسمع الكثير اليوم؛ لست مضطرًا لتفسير كل شيء دفعة واحدة.',
          'ما تتعلّمه اليوم لا يجب أن تستخدمه فورًا — ضعه جانبًا.',
          'قد يعلّمك الإصغاء اليوم أكثر من الكلام.',
        ],
        title: 'معلومات كثيرة',
      },
    },
    venus: {
      harmonious: {
        pulses: [
          'في علاقاتك مساحة ألطف اليوم. لا تنتظر لتقول لأحدهم إنه يهمّك.',
          'بناء القرب سهل اليوم. كن أنت من يخطو أولًا.',
          'ابقَ وقتًا أطول قليلًا بجانب ما تراه جميلًا.',
        ],
        title: 'لمسة لطيفة',
      },
      tense: {
        pulses: [
          'قد تؤلمك اليوم المسافة بين التوقّع والواقع. قول ما تريده أسهل من التلميح إليه.',
          'قل ما تنتظر أن يقوله لك أحدهم. الانتظار أكثر إيلامًا.',
          'إن لم تعد "تمشي الحال" تمشي فعلًا اليوم، فاعترف بذلك لنفسك.',
        ],
        title: 'فجوة التوقّع',
      },
      neutral: {
        pulses: [
          'يوم جيد لتلاحظ ما تريده — ومن تريده — حقًا.',
          'ما ترفضه يحكي عنك أكثر مما تقبله.',
          'ابحث اليوم عن جمال صغير؛ لست مضطرًا لانتظار الكبير.',
        ],
        title: 'القيم',
      },
    },
    mars: {
      harmonious: {
        pulses: [
          'طاقتك حاضرة للفعل اليوم. اخطُ خطوة صغيرة لكن حقيقية.',
          'أنجز أول عشر دقائق مما تؤجّله؛ الباقي يأتي بعدها.',
          'الشجاعة اليوم ليست غياب الخوف — بل أن تبدأ رغمه.',
        ],
        title: 'قوة المبادرة',
      },
      tense: {
        pulses: [
          'طاقة عالية وصبر قصير. تنفّس قبل أن تردّ؛ العجلة تكلّف أكثر من الوقت عادة.',
          'حتى حيث تكون على حق اليوم، رفع الصوت سيجعل الأمر أصعب.',
          'الغضب يحمل معلومة اليوم. اقرأها أولًا ثم تصرّف.',
        ],
        title: 'فتيل قصير',
      },
      neutral: {
        pulses: [
          'وجّه طاقتك اليوم، وإلا وجّهتك هي.',
          'اليوم ليس المهم كم تقدّمت، بل إلى أين.',
          'يوم جيد لاختيار الاتجاه لا السرعة.',
        ],
        title: 'طاقة تحتاج وجهة',
      },
    },
    jupiter: {
      harmonious: {
        pulses: [
          'المساحة تتّسع اليوم. لا سبب للتفكير الصغير.',
          'أعد قياس السقف الذي وضعته لنفسك؛ قد يكون أعلى مما ظننت.',
          'أن تريد شيئًا لا يعني أنك لا تستحقه.',
        ],
        title: 'مساحة تتّسع',
      },
      tense: {
        pulses: [
          'قد يبدو كل شيء أكبر مما هو اليوم. حدّ كرمك ترسمه أنت.',
          '"قليلًا بعد" تُقال بسهولة اليوم. معرفة أين يقف كفايتك مهمتك أنت.',
          'انظر إلى جدولك قبل أن تَعِد بشيء اليوم.',
        ],
        title: 'ميل إلى المبالغة',
      },
      neutral: {
        pulses: [
          'قد ينفرج باب اليوم؛ ما دام مواربًا فلا داعي للعجلة.',
          'فضول صغير اليوم قد يكون بداية طريق طويل.',
          'قد تشعر أنك تأخّرت على تعلّم شيء. لم تتأخّر.',
        ],
        title: 'باب موارب',
      },
    },
    saturn: {
      harmonious: {
        pulses: [
          'قد يثمر صبرك اليوم. التقدّم البطيء ليس تراجعًا.',
          'انظر إلى مجموع الشيء الصغير الذي تفعله منذ زمن.',
          'الانضباط اليوم ليس عقوبة؛ إنه وعد قطعته لنفسك.',
        ],
        title: 'أرض صلبة',
      },
      tense: {
        pulses: [
          'قد تصطدم بحدّ اليوم. الحدّ ليس جدارًا دائمًا؛ أحيانًا هو مجرد إشارة طريق.',
          'قد يُغلق باب اليوم. ليس كل باب مغلق رفضًا.',
          'إن كنت متعبًا اليوم، فلعلّ ما يجب تقليصه هو التوقّع لا العمل.',
        ],
        title: 'حدّ وتأخير',
      },
      neutral: {
        pulses: [
          'الصغير المستمر أثمن اليوم من الكبير اللامع.',
          'افعل اليوم أصغر نسخة ممكنة مما قلت إنك ستبدأه "غدًا".',
          'الصبر اليوم ليس جمودًا؛ بل متابعة، ولو ببطء.',
        ],
        title: 'خطوة قابلة للاستمرار',
      },
    },
    uranus: {
      harmonious: {
        pulses: [
          'قد يريحك كسر عادة اليوم. جرّب شيئًا صغيرًا بطريقة أخرى.',
          'الخروج عن مسارك المعتاد يناسبك اليوم.',
          'غرابة فكرة لا تعني أنها خاطئة.',
        ],
        title: 'نظرة جديدة',
      },
      tense: {
        pulses: [
          'قد تنهار الخطط اليوم. المرونة تنفع أكثر من أن تكون على حق.',
          'إن لم تسر الأمور كما خُطّط لها اليوم، دافع عن الهدف لا عن الخطة.',
          'إن جاءتك رغبة مفاجئة اليوم فنَم عليها؛ إن بقيت غدًا فافعلها.',
        ],
        title: 'تغيّر مفاجئ',
      },
      neutral: {
        pulses: [
          'ما هو غير متوقّع اليوم ليس بالضرورة سيئًا.',
          'ما اعتدت عليه قد يريحك — لكن هل يتقدّم بك؟',
          'تغيير صغير اليوم قد يجعل قرارًا كبيرًا بلا لزوم.',
        ],
        title: 'غير المتوقّع',
      },
    },
    neptune: {
      harmonious: {
        pulses: [
          'حدسك حاد اليوم. أصغِ أيضًا لما لا تستطيع شرحه.',
          'قد يأتيك الإلهام من مكان غير متوقّع اليوم؛ دوّنه.',
          'اسمح لنفسك بالحلم اليوم؛ ليس كل شيء بحاجة إلى خطة.',
        ],
        title: 'حدس قوي',
      },
      tense: {
        pulses: [
          'قد تتشوّش الحدود اليوم. التمييز بين ما هو لك وما ليس لك يخفّف يومك.',
          'أن تقول لا اليوم لا يعني أنك تخذل أحدًا.',
          'تحقّق مرة أخرى مما تظن أنك رأيته اليوم.',
        ],
        title: 'حدود ضبابية',
      },
      neutral: {
        pulses: [
          'لا تحاول توضيح كل شيء اليوم؛ بعض الأمور تستقر وحدها.',
          'الغموض اليوم ليس بالضرورة خبرًا سيئًا.',
          'البقاء في الهدوء اليوم يجلب بعض الأجوبة من تلقاء نفسها.',
        ],
        title: 'ما لم يتّضح بعد',
      },
    },
    pluto: {
      harmonious: {
        pulses: [
          'قد يكون ترك ما ينبغي تركه أسهل مما تظن اليوم.',
          'ضع جانبًا ما أتعبك حمله.',
          'انتهاء شيء لا يعني أنه ذهب سدى.',
        ],
        title: 'وعي عميق',
      },
      tense: {
        pulses: [
          'قد ترتفع رغبة السيطرة اليوم. ما لا تمسكه يتعبك أقل.',
          'إن أردت إمساك كل شيء اليوم، فانظر أولًا مما تخاف.',
          'ألّا تدخل في صراع قوة هو أيضًا استعراض للقوة.',
        ],
        title: 'رغبة في السيطرة',
      },
      neutral: {
        pulses: [
          'شيء يتحرّك تحت السطح اليوم؛ يكفي أن تنظر دون أن تضغط.',
          'التغيير يبدأ عادة حيث لا يُرى.',
          'الصدق مع نفسك قد يكون اليوم أصعب من الانفتاح على غيرك.',
        ],
        title: 'تحت السطح',
      },
    },
    chiron: {
      harmonious: {
        pulses: [
          'تستطيع النظر إلى جرح قديم برفق اليوم. الشفاء لا يعني النسيان.',
          'حدّث نفسك اليوم كما تحدّث شخصًا تحبّه.',
          'ما مررت به قد يدلّ غيرك على الطريق اليوم.',
        ],
        title: 'نظرة رحيمة',
      },
      tense: {
        pulses: [
          'قد تُلمس نقطة حسّاسة اليوم. عامل نفسك كما تعامل غيرك.',
          'إن عادت إليك جملة قديمة اليوم، فقائلها لم يكن بالضرورة على حق.',
          'حيث انكسرت هو أيضًا حيث تفهم أكثر.',
        ],
        title: 'نقطة حسّاسة',
      },
      neutral: {
        pulses: [
          'ما يرهقك قد يكون نفسه ما تستطيع أن تساعد به غيرك.',
          'الشفاء اليوم ليس التظاهر بأن شيئًا لم يؤلم.',
          'طلب المساعدة ليس نقصًا؛ إنه تغيير اتجاه.',
        ],
        title: 'الجرح والشفاء',
      },
    },
    northNode: {
      harmonious: {
        pulses: [
          'خطوة في الاتجاه الصحيح سهلة اليوم. اختر الصحيح لا المألوف.',
          'اخطُ خطوة خارج العادة اليوم؛ المألوف ليس صحيحًا دائمًا.',
          'اختر ما ينمّيك على ما يريحك.',
        ],
        title: 'الاتجاه الصحيح',
      },
      tense: {
        pulses: [
          'هناك شدّ بين العادة والاتجاه اليوم. المريح ليس دائمًا الصحيح.',
          'قد ترغب في العودة اليوم. كان هناك سبب لعدم بقائك هناك.',
          'السهل والصحيح قد لا ينظران إلى الجهة نفسها اليوم.',
        ],
        title: 'جذب المألوف',
      },
      neutral: {
        pulses: [
          'اختيار صغير اليوم قد يرسم مرحلة طويلة.',
          '"نعم" أو "لا" صغيرة قد تشكّل سنة كاملة.',
          'إن لم تعرف إلى أين تذهب، فاكتب إلى أين لا تريد أن تذهب.',
        ],
        title: 'اختيار وجهة',
      },
    },
  },
  areas: {
    sun: 'ثقتك بنفسك وطريقتك في التعبير',
    moon: 'مشاعرك وعالمك الداخلي',
    mercury: 'طريقتك في التفكير والكلام',
    venus: 'علاقاتك وما تقدّره',
    mars: 'طاقتك وطريقتك في المبادرة',
    jupiter: 'مجال نموّك واتّساعك',
    saturn: 'مسؤولياتك وحدودك',
    uranus: 'حاجتك إلى الحرية',
    neptune: 'خيالك وحدسك',
    pluto: 'مجال تحوّلك',
    chiron: 'نقطتك الحسّاسة',
    northNode: 'اتجاه حياتك',
    asc: 'الانطباع الأول الذي تتركه',
    mc: 'مهنتك ومكانتك الاجتماعية',
  },
  fallbackPulses: [
    'السماء هادئة اليوم. يوم جيد لتضبط إيقاعك الخاص.',
    'لا زاوية ضيّقة في خريطتك اليوم؛ اليوم تكتبه أنت.',
    'لا دفعة من الخارج اليوم. يوم جيد لتتذكّر ما تريده فعلًا.',
  ],
  noAspect: 'لا زاوية ضيّقة مع خريطتك اليوم',
  strengthLead: (area) => `اليوم يدعم ${area}.`,
  cautionLead: (area) => `اليوم يضغط على ${area}.`,
  where: (n, house) => ` يظهر الأثر أكثر في البيت ${n} (${house}).`,
  source: (t, n, aspect) => `${t} العابر ← ${n} في الخريطة · ${aspect}`,
  moonLine: (sign, phase, pct) => `القمر في ${sign} · ${phase} · ${pct}٪`,
};

export const DAILY_TEXT: Record<Locale, DailyText> = { tr, en, de, fr, ar };

export function dailyText(locale: Locale): DailyText {
  return DAILY_TEXT[locale] ?? DAILY_TEXT.en;
}
