/**
 * Astroloji terimlerinin dile göre karşılıkları.
 *
 * `constants.ts` yalnızca yapıyı (indeks, sembol, element, ağırlık) tutar;
 * görünen adlar buradadır. Saf TypeScript: React Native'e bağımlı değil,
 * hem uygulama hem sunucu vekilleri kullanabilir.
 */
import type { Locale } from '@/i18n/locales';

import type { AspectType, BodyId, DignityKind, Element, HouseSystem, Modality } from './types';

export interface AstroText {
  /** 12 burç, Koç'tan başlayarak */
  signs: readonly string[];
  bodies: Record<BodyId, string>;
  /** Tablolarda kullanılan kısa ad */
  bodiesShort: Record<BodyId, string>;
  /** 12 ev, 1. evden başlayarak */
  houses: readonly string[];
  aspects: Record<AspectType, string>;
  elements: Record<Element, string>;
  modalities: Record<Modality, string>;
  dignities: Record<DignityKind, string>;
  houseSystems: Record<HouseSystem, string>;
  /** Sekiz Ay evresi, Yeni Ay'dan başlayarak */
  moonPhases: readonly string[];
  /** Sinastri alt skorları */
  synastryCategories: Record<'love' | 'communication' | 'harmony' | 'passion' | 'stability', string>;
}

const tr: AstroText = {
  signs: ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'],
  bodies: {
    sun: 'Güneş', moon: 'Ay', mercury: 'Merkür', venus: 'Venüs', mars: 'Mars',
    jupiter: 'Jüpiter', saturn: 'Satürn', uranus: 'Uranüs', neptune: 'Neptün', pluto: 'Plüton',
    chiron: 'Chiron', northNode: 'Kuzey Ay Düğümü', southNode: 'Güney Ay Düğümü', lilith: 'Lilith (Kara Ay)',
    asc: 'Yükselen', mc: 'Tepe Noktası (MC)', dsc: 'Alçalan (DSC)', ic: 'Dip Noktası (IC)',
    vertex: 'Vertex', fortune: 'Şans Noktası',
  },
  bodiesShort: {
    sun: 'Gün', moon: 'Ay', mercury: 'Mer', venus: 'Ven', mars: 'Mar', jupiter: 'Jüp', saturn: 'Sat',
    uranus: 'Ura', neptune: 'Nep', pluto: 'Plü', chiron: 'Chi', northNode: 'KAD', southNode: 'GAD',
    lilith: 'Lil', asc: 'ASC', mc: 'MC', dsc: 'DSC', ic: 'IC', vertex: 'Vtx', fortune: 'ŞN',
  },
  houses: [
    'Benlik ve Görünüm', 'Para ve Değerler', 'İletişim ve Yakın Çevre', 'Ev, Aile ve Kökler',
    'Aşk, Yaratıcılık ve Çocuklar', 'Sağlık ve Günlük Düzen', 'Evlilik ve Ortaklıklar',
    'Dönüşüm ve Paylaşılan Kaynaklar', 'Felsefe, Yolculuk ve Yüksek Öğrenim',
    'Kariyer ve Toplumsal Konum', 'Dostluklar ve İdealler', 'Bilinçaltı ve Ruhsal Yaşam',
  ],
  aspects: {
    conjunction: 'Kavuşum', opposition: 'Karşıt', trine: 'Üçgen', square: 'Kare', sextile: 'Altmışlık',
    quincunx: 'Yüzellilik', semisextile: 'Otuzluk', semisquare: 'Yarım Kare',
    sesquiquadrate: 'Birbuçuk Kare', quintile: 'Beşlik', biquintile: 'Çift Beşlik',
  },
  elements: { fire: 'Ateş', earth: 'Toprak', air: 'Hava', water: 'Su' },
  modalities: { cardinal: 'Öncü', fixed: 'Sabit', mutable: 'Değişken' },
  dignities: {
    domicile: 'Yöneticilik (kendi burcunda)', exaltation: 'Yücelme',
    detriment: 'Zararlı (sürgün)', fall: 'Düşük',
  },
  moonPhases: ['Yeni Ay', 'Hilal (Büyüyen)', 'İlk Dördün', 'Şişkin Ay (Büyüyen)', 'Dolunay', 'Şişkin Ay (Küçülen)', 'Son Dördün', 'Hilal (Küçülen)'],
  synastryCategories: { love: 'Aşk & Romantizm', communication: 'İletişim', harmony: 'Duygusal Uyum', passion: 'Tutku & Çekim', stability: 'Kalıcılık & Güven' },
  houseSystems: {
    placidus: 'Placidus', koch: 'Koch', whole: 'Tam Burç (Whole Sign)', equal: 'Eşit Ev',
    porphyry: 'Porphyry', campanus: 'Campanus', regiomontanus: 'Regiomontanus',
  },
};

const en: AstroText = {
  signs: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  bodies: {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    chiron: 'Chiron', northNode: 'North Node', southNode: 'South Node', lilith: 'Lilith (Black Moon)',
    asc: 'Ascendant', mc: 'Midheaven (MC)', dsc: 'Descendant (DSC)', ic: 'Imum Coeli (IC)',
    vertex: 'Vertex', fortune: 'Part of Fortune',
  },
  bodiesShort: {
    sun: 'Sun', moon: 'Moon', mercury: 'Mer', venus: 'Ven', mars: 'Mar', jupiter: 'Jup', saturn: 'Sat',
    uranus: 'Ura', neptune: 'Nep', pluto: 'Plu', chiron: 'Chi', northNode: 'NN', southNode: 'SN',
    lilith: 'Lil', asc: 'ASC', mc: 'MC', dsc: 'DSC', ic: 'IC', vertex: 'Vtx', fortune: 'PoF',
  },
  houses: [
    'Self and Appearance', 'Money and Values', 'Communication and Immediate Circle', 'Home, Family and Roots',
    'Love, Creativity and Children', 'Health and Daily Routine', 'Marriage and Partnerships',
    'Transformation and Shared Resources', 'Philosophy, Travel and Higher Learning',
    'Career and Public Standing', 'Friendships and Ideals', 'The Subconscious and Inner Life',
  ],
  aspects: {
    conjunction: 'Conjunction', opposition: 'Opposition', trine: 'Trine', square: 'Square', sextile: 'Sextile',
    quincunx: 'Quincunx', semisextile: 'Semi-sextile', semisquare: 'Semi-square',
    sesquiquadrate: 'Sesquiquadrate', quintile: 'Quintile', biquintile: 'Biquintile',
  },
  elements: { fire: 'Fire', earth: 'Earth', air: 'Air', water: 'Water' },
  modalities: { cardinal: 'Cardinal', fixed: 'Fixed', mutable: 'Mutable' },
  dignities: {
    domicile: 'Domicile (own sign)', exaltation: 'Exaltation',
    detriment: 'Detriment', fall: 'Fall',
  },
  moonPhases: ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'],
  synastryCategories: { love: 'Love & Romance', communication: 'Communication', harmony: 'Emotional Harmony', passion: 'Passion & Attraction', stability: 'Stability & Trust' },
  houseSystems: {
    placidus: 'Placidus', koch: 'Koch', whole: 'Whole Sign', equal: 'Equal House',
    porphyry: 'Porphyry', campanus: 'Campanus', regiomontanus: 'Regiomontanus',
  },
};

const de: AstroText = {
  signs: ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'],
  bodies: {
    sun: 'Sonne', moon: 'Mond', mercury: 'Merkur', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptun', pluto: 'Pluto',
    chiron: 'Chiron', northNode: 'Aufsteigender Mondknoten', southNode: 'Absteigender Mondknoten',
    lilith: 'Lilith (Schwarzer Mond)', asc: 'Aszendent', mc: 'Medium Coeli (MC)',
    dsc: 'Deszendent (DC)', ic: 'Imum Coeli (IC)', vertex: 'Vertex', fortune: 'Glückspunkt',
  },
  bodiesShort: {
    sun: 'Son', moon: 'Mon', mercury: 'Mer', venus: 'Ven', mars: 'Mar', jupiter: 'Jup', saturn: 'Sat',
    uranus: 'Ura', neptune: 'Nep', pluto: 'Plu', chiron: 'Chi', northNode: 'AMK', southNode: 'DMK',
    lilith: 'Lil', asc: 'AC', mc: 'MC', dsc: 'DC', ic: 'IC', vertex: 'Vtx', fortune: 'GP',
  },
  houses: [
    'Selbst und Auftreten', 'Geld und Werte', 'Kommunikation und näheres Umfeld', 'Zuhause, Familie und Wurzeln',
    'Liebe, Kreativität und Kinder', 'Gesundheit und Alltag', 'Ehe und Partnerschaften',
    'Wandlung und gemeinsame Ressourcen', 'Philosophie, Reisen und höhere Bildung',
    'Beruf und gesellschaftliche Stellung', 'Freundschaften und Ideale', 'Unterbewusstsein und Innenleben',
  ],
  aspects: {
    conjunction: 'Konjunktion', opposition: 'Opposition', trine: 'Trigon', square: 'Quadrat', sextile: 'Sextil',
    quincunx: 'Quincunx', semisextile: 'Halbsextil', semisquare: 'Halbquadrat',
    sesquiquadrate: 'Anderthalbquadrat', quintile: 'Quintil', biquintile: 'Biquintil',
  },
  elements: { fire: 'Feuer', earth: 'Erde', air: 'Luft', water: 'Wasser' },
  modalities: { cardinal: 'Kardinal', fixed: 'Fix', mutable: 'Veränderlich' },
  dignities: {
    domicile: 'Domizil (eigenes Zeichen)', exaltation: 'Erhöhung',
    detriment: 'Exil', fall: 'Fall',
  },
  moonPhases: ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel'],
  synastryCategories: { love: 'Liebe & Romantik', communication: 'Kommunikation', harmony: 'Emotionale Harmonie', passion: 'Leidenschaft & Anziehung', stability: 'Beständigkeit & Vertrauen' },
  houseSystems: {
    placidus: 'Placidus', koch: 'Koch', whole: 'Ganzzeichen', equal: 'Gleiche Häuser',
    porphyry: 'Porphyrius', campanus: 'Campanus', regiomontanus: 'Regiomontanus',
  },
};

const fr: AstroText = {
  signs: ['Bélier', 'Taureau', 'Gémeaux', 'Cancer', 'Lion', 'Vierge', 'Balance', 'Scorpion', 'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'],
  bodies: {
    sun: 'Soleil', moon: 'Lune', mercury: 'Mercure', venus: 'Vénus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturne', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluton',
    chiron: 'Chiron', northNode: 'Nœud Nord', southNode: 'Nœud Sud', lilith: 'Lilith (Lune noire)',
    asc: 'Ascendant', mc: 'Milieu du Ciel (MC)', dsc: 'Descendant (DS)', ic: 'Fond du Ciel (FC)',
    vertex: 'Vertex', fortune: 'Part de Fortune',
  },
  bodiesShort: {
    sun: 'Sol', moon: 'Lun', mercury: 'Mer', venus: 'Vén', mars: 'Mar', jupiter: 'Jup', saturn: 'Sat',
    uranus: 'Ura', neptune: 'Nep', pluto: 'Plu', chiron: 'Chi', northNode: 'NN', southNode: 'NS',
    lilith: 'Lil', asc: 'ASC', mc: 'MC', dsc: 'DS', ic: 'FC', vertex: 'Vtx', fortune: 'PdF',
  },
  houses: [
    'Soi et apparence', 'Argent et valeurs', 'Communication et entourage proche', 'Foyer, famille et racines',
    'Amour, créativité et enfants', 'Santé et routine quotidienne', 'Mariage et partenariats',
    'Transformation et ressources partagées', 'Philosophie, voyages et études supérieures',
    'Carrière et statut social', 'Amitiés et idéaux', 'Inconscient et vie intérieure',
  ],
  aspects: {
    conjunction: 'Conjonction', opposition: 'Opposition', trine: 'Trigone', square: 'Carré', sextile: 'Sextile',
    quincunx: 'Quinconce', semisextile: 'Semi-sextile', semisquare: 'Semi-carré',
    sesquiquadrate: 'Sesqui-carré', quintile: 'Quintile', biquintile: 'Bi-quintile',
  },
  elements: { fire: 'Feu', earth: 'Terre', air: 'Air', water: 'Eau' },
  modalities: { cardinal: 'Cardinal', fixed: 'Fixe', mutable: 'Mutable' },
  dignities: {
    domicile: 'Domicile (son propre signe)', exaltation: 'Exaltation',
    detriment: 'Exil', fall: 'Chute',
  },
  moonPhases: ['Nouvelle Lune', 'Premier croissant', 'Premier quartier', 'Lune gibbeuse croissante', 'Pleine Lune', 'Lune gibbeuse décroissante', 'Dernier quartier', 'Dernier croissant'],
  synastryCategories: { love: 'Amour & romance', communication: 'Communication', harmony: 'Harmonie émotionnelle', passion: 'Passion & attirance', stability: 'Stabilité & confiance' },
  houseSystems: {
    placidus: 'Placidus', koch: 'Koch', whole: 'Signes entiers', equal: 'Maisons égales',
    porphyry: 'Porphyre', campanus: 'Campanus', regiomontanus: 'Regiomontanus',
  },
};

const ar: AstroText = {
  signs: ['الحمل', 'الثور', 'الجوزاء', 'السرطان', 'الأسد', 'العذراء', 'الميزان', 'العقرب', 'القوس', 'الجدي', 'الدلو', 'الحوت'],
  bodies: {
    sun: 'الشمس', moon: 'القمر', mercury: 'عطارد', venus: 'الزهرة', mars: 'المريخ',
    jupiter: 'المشتري', saturn: 'زحل', uranus: 'أورانوس', neptune: 'نبتون', pluto: 'بلوتو',
    chiron: 'خيرون', northNode: 'العقدة الشمالية', southNode: 'العقدة الجنوبية', lilith: 'ليليث (القمر الأسود)',
    asc: 'الطالع', mc: 'وسط السماء', dsc: 'الغارب', ic: 'وتد الأرض',
    vertex: 'الفيرتكس', fortune: 'سهم السعادة',
  },
  bodiesShort: {
    sun: 'شمس', moon: 'قمر', mercury: 'عطا', venus: 'زهر', mars: 'مري', jupiter: 'مشت', saturn: 'زحل',
    uranus: 'أور', neptune: 'نبت', pluto: 'بلو', chiron: 'خير', northNode: 'ع.ش', southNode: 'ع.ج',
    lilith: 'ليل', asc: 'طالع', mc: 'و.س', dsc: 'غارب', ic: 'و.أ', vertex: 'فير', fortune: 'س.س',
  },
  houses: [
    'الذات والمظهر', 'المال والقيم', 'التواصل والمحيط القريب', 'البيت والعائلة والجذور',
    'الحب والإبداع والأبناء', 'الصحة والروتين اليومي', 'الزواج والشراكات',
    'التحوّل والموارد المشتركة', 'الفلسفة والسفر والتعليم العالي',
    'المهنة والمكانة الاجتماعية', 'الصداقات والمثل العليا', 'اللاوعي والحياة الداخلية',
  ],
  aspects: {
    conjunction: 'اقتران', opposition: 'مقابلة', trine: 'تثليث', square: 'تربيع', sextile: 'تسديس',
    quincunx: 'كوينكونكس', semisextile: 'نصف تسديس', semisquare: 'نصف تربيع',
    sesquiquadrate: 'تربيع ونصف', quintile: 'تخميس', biquintile: 'تخميس مزدوج',
  },
  elements: { fire: 'نار', earth: 'تراب', air: 'هواء', water: 'ماء' },
  modalities: { cardinal: 'متحرك', fixed: 'ثابت', mutable: 'متغير' },
  dignities: {
    domicile: 'في بيته', exaltation: 'الشرف',
    detriment: 'الوبال', fall: 'الهبوط',
  },
  moonPhases: ['محاق', 'هلال متزايد', 'التربيع الأول', 'أحدب متزايد', 'بدر', 'أحدب متناقص', 'التربيع الأخير', 'هلال متناقص'],
  synastryCategories: { love: 'الحب والرومانسية', communication: 'التواصل', harmony: 'الانسجام العاطفي', passion: 'الشغف والانجذاب', stability: 'الثبات والثقة' },
  houseSystems: {
    placidus: 'بلاسيدوس', koch: 'كوخ', whole: 'البروج الكاملة', equal: 'البيوت المتساوية',
    porphyry: 'فرفوريوس', campanus: 'كامبانوس', regiomontanus: 'ريجيومونتانوس',
  },
};

export const ASTRO_TEXT: Record<Locale, AstroText> = { tr, en, de, fr, ar };

export function astroText(locale: Locale): AstroText {
  return ASTRO_TEXT[locale] ?? ASTRO_TEXT.en;
}
