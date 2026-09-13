import type { AspectType, BodyId, Element, Modality, PlanetId, PointId } from './types';

/* ------------------------------------------------------------------ */
/* Burçlar                                                             */
/* ------------------------------------------------------------------ */

export interface SignInfo {
  index: number;
  key: string;
  name: string;
  symbol: string;
  element: Element;
  modality: Modality;
  /** Klasik yönetici */
  ruler: PlanetId;
  /** Modern yönetici (farklıysa) */
  modernRuler?: PlanetId;
}

export const SIGNS: readonly SignInfo[] = [
  { index: 0, key: 'aries', name: 'Koç', symbol: '♈\uFE0E', element: 'fire', modality: 'cardinal', ruler: 'mars' },
  { index: 1, key: 'taurus', name: 'Boğa', symbol: '♉\uFE0E', element: 'earth', modality: 'fixed', ruler: 'venus' },
  { index: 2, key: 'gemini', name: 'İkizler', symbol: '♊\uFE0E', element: 'air', modality: 'mutable', ruler: 'mercury' },
  { index: 3, key: 'cancer', name: 'Yengeç', symbol: '♋\uFE0E', element: 'water', modality: 'cardinal', ruler: 'moon' },
  { index: 4, key: 'leo', name: 'Aslan', symbol: '♌\uFE0E', element: 'fire', modality: 'fixed', ruler: 'sun' },
  { index: 5, key: 'virgo', name: 'Başak', symbol: '♍\uFE0E', element: 'earth', modality: 'mutable', ruler: 'mercury' },
  { index: 6, key: 'libra', name: 'Terazi', symbol: '♎\uFE0E', element: 'air', modality: 'cardinal', ruler: 'venus' },
  { index: 7, key: 'scorpio', name: 'Akrep', symbol: '♏\uFE0E', element: 'water', modality: 'fixed', ruler: 'mars', modernRuler: 'pluto' },
  { index: 8, key: 'sagittarius', name: 'Yay', symbol: '♐\uFE0E', element: 'fire', modality: 'mutable', ruler: 'jupiter' },
  { index: 9, key: 'capricorn', name: 'Oğlak', symbol: '♑\uFE0E', element: 'earth', modality: 'cardinal', ruler: 'saturn' },
  { index: 10, key: 'aquarius', name: 'Kova', symbol: '♒\uFE0E', element: 'air', modality: 'fixed', ruler: 'saturn', modernRuler: 'uranus' },
  { index: 11, key: 'pisces', name: 'Balık', symbol: '♓\uFE0E', element: 'water', modality: 'mutable', ruler: 'jupiter', modernRuler: 'neptune' },
] as const;

export const ELEMENT_NAMES: Record<Element, string> = {
  fire: 'Ateş',
  earth: 'Toprak',
  air: 'Hava',
  water: 'Su',
};

export const MODALITY_NAMES: Record<Modality, string> = {
  cardinal: 'Öncü',
  fixed: 'Sabit',
  mutable: 'Değişken',
};

/* ------------------------------------------------------------------ */
/* Gezegenler ve noktalar                                              */
/* ------------------------------------------------------------------ */

export interface BodyInfo {
  id: BodyId;
  name: string;
  shortName: string;
  symbol: string;
  /** Fiziksel gök cismi mi (hız/retro anlamlı) */
  physical: boolean;
  /** Element/nitelik dengesinde ağırlık */
  weight: number;
}

export const PLANET_ORDER: readonly PlanetId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northNode',
  'southNode',
  'lilith',
];

export const POINT_ORDER: readonly PointId[] = ['asc', 'mc', 'dsc', 'ic', 'vertex', 'fortune'];

export const BODIES: Record<BodyId, BodyInfo> = {
  sun: { id: 'sun', name: 'Güneş', shortName: 'Gün', symbol: '☉', physical: true, weight: 3 },
  moon: { id: 'moon', name: 'Ay', shortName: 'Ay', symbol: '☽', physical: true, weight: 3 },
  mercury: { id: 'mercury', name: 'Merkür', shortName: 'Mer', symbol: '☿', physical: true, weight: 2 },
  venus: { id: 'venus', name: 'Venüs', shortName: 'Ven', symbol: '♀\uFE0E', physical: true, weight: 2 },
  mars: { id: 'mars', name: 'Mars', shortName: 'Mar', symbol: '♂\uFE0E', physical: true, weight: 2 },
  jupiter: { id: 'jupiter', name: 'Jüpiter', shortName: 'Jüp', symbol: '♃', physical: true, weight: 1.5 },
  saturn: { id: 'saturn', name: 'Satürn', shortName: 'Sat', symbol: '♄', physical: true, weight: 1.5 },
  uranus: { id: 'uranus', name: 'Uranüs', shortName: 'Ura', symbol: '♅', physical: true, weight: 1 },
  neptune: { id: 'neptune', name: 'Neptün', shortName: 'Nep', symbol: '♆', physical: true, weight: 1 },
  pluto: { id: 'pluto', name: 'Plüton', shortName: 'Plü', symbol: '♇', physical: true, weight: 1 },
  chiron: { id: 'chiron', name: 'Chiron', shortName: 'Chi', symbol: '⚷', physical: true, weight: 0.5 },
  northNode: { id: 'northNode', name: 'Kuzey Ay Düğümü', shortName: 'KAD', symbol: '☊', physical: false, weight: 0.5 },
  southNode: { id: 'southNode', name: 'Güney Ay Düğümü', shortName: 'GAD', symbol: '☋', physical: false, weight: 0 },
  lilith: { id: 'lilith', name: 'Lilith (Kara Ay)', shortName: 'Lil', symbol: '⚸', physical: false, weight: 0.5 },
  asc: { id: 'asc', name: 'Yükselen', shortName: 'ASC', symbol: 'ASC', physical: false, weight: 2 },
  mc: { id: 'mc', name: 'Tepe Noktası (MC)', shortName: 'MC', symbol: 'MC', physical: false, weight: 1 },
  dsc: { id: 'dsc', name: 'Alçalan (DSC)', shortName: 'DSC', symbol: 'DSC', physical: false, weight: 0 },
  ic: { id: 'ic', name: 'Dip Noktası (IC)', shortName: 'IC', symbol: 'IC', physical: false, weight: 0 },
  vertex: { id: 'vertex', name: 'Vertex', shortName: 'Vtx', symbol: 'Vx', physical: false, weight: 0 },
  fortune: { id: 'fortune', name: 'Şans Noktası', shortName: 'ŞN', symbol: '⊗', physical: false, weight: 0 },
};

/* ------------------------------------------------------------------ */
/* Açılar                                                              */
/* ------------------------------------------------------------------ */

export interface AspectInfo {
  type: AspectType;
  name: string;
  symbol: string;
  angle: number;
  /** Varsayılan orb (derece) */
  orb: number;
  major: boolean;
  /** 'harmonious' | 'tense' | 'neutral' */
  nature: 'harmonious' | 'tense' | 'neutral';
}

export const ASPECTS: Record<AspectType, AspectInfo> = {
  conjunction: { type: 'conjunction', name: 'Kavuşum', symbol: '☌', angle: 0, orb: 8, major: true, nature: 'neutral' },
  opposition: { type: 'opposition', name: 'Karşıt', symbol: '☍', angle: 180, orb: 8, major: true, nature: 'tense' },
  trine: { type: 'trine', name: 'Üçgen', symbol: '△', angle: 120, orb: 7, major: true, nature: 'harmonious' },
  square: { type: 'square', name: 'Kare', symbol: '□', angle: 90, orb: 7, major: true, nature: 'tense' },
  sextile: { type: 'sextile', name: 'Altmışlık', symbol: '⚹', angle: 60, orb: 5, major: true, nature: 'harmonious' },
  quincunx: { type: 'quincunx', name: 'Yüzellilik', symbol: '⚻', angle: 150, orb: 3, major: false, nature: 'tense' },
  semisextile: { type: 'semisextile', name: 'Otuzluk', symbol: '⚺', angle: 30, orb: 2, major: false, nature: 'harmonious' },
  semisquare: { type: 'semisquare', name: 'Yarım Kare', symbol: '∠', angle: 45, orb: 2, major: false, nature: 'tense' },
  sesquiquadrate: { type: 'sesquiquadrate', name: 'Birbuçuk Kare', symbol: '⚼', angle: 135, orb: 2, major: false, nature: 'tense' },
  quintile: { type: 'quintile', name: 'Beşlik', symbol: 'Q', angle: 72, orb: 1.5, major: false, nature: 'harmonious' },
  biquintile: { type: 'biquintile', name: 'Çift Beşlik', symbol: 'bQ', angle: 144, orb: 1.5, major: false, nature: 'harmonious' },
};

export const DEFAULT_ASPECT_TYPES: readonly AspectType[] = [
  'conjunction',
  'opposition',
  'trine',
  'square',
  'sextile',
  'quincunx',
];

export const DEFAULT_ASPECT_BODIES: readonly BodyId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'chiron',
  'northNode',
  'asc',
  'mc',
];

/* ------------------------------------------------------------------ */
/* Ev sistemleri                                                       */
/* ------------------------------------------------------------------ */

export const HOUSE_SYSTEM_NAMES: Record<string, string> = {
  placidus: 'Placidus',
  koch: 'Koch',
  whole: 'Tam Burç (Whole Sign)',
  equal: 'Eşit Ev',
  porphyry: 'Porphyry',
  campanus: 'Campanus',
  regiomontanus: 'Regiomontanus',
};

export const HOUSE_NAMES: readonly string[] = [
  'Benlik ve Görünüm',
  'Para ve Değerler',
  'İletişim ve Yakın Çevre',
  'Ev, Aile ve Kökler',
  'Aşk, Yaratıcılık ve Çocuklar',
  'Sağlık ve Günlük Düzen',
  'Evlilik ve Ortaklıklar',
  'Dönüşüm ve Paylaşılan Kaynaklar',
  'Felsefe, Yolculuk ve Yüksek Öğrenim',
  'Kariyer ve Toplumsal Konum',
  'Dostluklar ve İdealler',
  'Bilinçaltı ve Ruhsal Yaşam',
];

/* ------------------------------------------------------------------ */
/* Onurlar (dignities)                                                 */
/* ------------------------------------------------------------------ */

/** Yücelme (exaltation) burcu */
export const EXALTATION: Partial<Record<PlanetId, number>> = {
  sun: 0, // Koç
  moon: 1, // Boğa
  mercury: 5, // Başak
  venus: 11, // Balık
  mars: 9, // Oğlak
  jupiter: 3, // Yengeç
  saturn: 6, // Terazi
};
