/**
 * Astroloji çekirdeği — tip tanımları.
 * Bu modül React Native'e bağımlı değildir; Node'da test edilir.
 */

/** Haritada konumu hesaplanan gök cisimleri */
export type PlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto'
  | 'chiron'
  | 'northNode'
  | 'southNode'
  | 'lilith';

/** Hesaplanan (fiziksel olmayan) noktalar */
export type PointId = 'asc' | 'mc' | 'dsc' | 'ic' | 'vertex' | 'fortune';

export type BodyId = PlanetId | PointId;

export type HouseSystem =
  | 'placidus'
  | 'koch'
  | 'whole'
  | 'equal'
  | 'porphyry'
  | 'campanus'
  | 'regiomontanus';

export type NodeType = 'true' | 'mean';

export type AspectType =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisextile'
  | 'semisquare'
  | 'sesquiquadrate'
  | 'quintile'
  | 'biquintile';

export type Element = 'fire' | 'earth' | 'air' | 'water';
export type Modality = 'cardinal' | 'fixed' | 'mutable';

export interface GeoLocation {
  /** Enlem, derece, kuzey pozitif */
  lat: number;
  /** Boylam, derece, doğu pozitif */
  lng: number;
}

/** Kullanıcının girdiği doğum bilgisi (yerel saat) */
export interface BirthInput {
  name?: string;
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
  /** IANA saat dilimi, örn. "Europe/Istanbul" */
  timeZone: string;
  location: GeoLocation;
  placeName?: string;
  /** Doğum saati bilinmiyorsa öğlen 12:00 kullanılır, evler güvenilmez işaretlenir */
  timeUnknown?: boolean;
}

export interface ChartOptions {
  houseSystem?: HouseSystem;
  nodeType?: NodeType;
  /** Açı hesabına dahil edilecek cisimler */
  aspectBodies?: BodyId[];
  /** Açı türü → orb (derece). Verilmezse varsayılan tablo kullanılır. */
  orbs?: Partial<Record<AspectType, number>>;
  /** Güneş/Ay için orb çarpanı (varsayılan 1.25) */
  luminaryOrbFactor?: number;
  /** Bu açı türleri hesaplanır (varsayılan: majör 5 + quincunx) */
  aspectTypes?: AspectType[];
}

export interface ZodiacPosition {
  /** 0–360 tropikal ekliptik boylam */
  longitude: number;
  /** 0–11, Koç = 0 */
  sign: number;
  /** Burç içindeki derece 0–30 */
  degreeInSign: number;
  /** Tam derece / dakika / saniye */
  deg: number;
  min: number;
  sec: number;
}

export interface BodyPosition extends ZodiacPosition {
  id: BodyId;
  /** Ekliptik enlem (derece) */
  latitude: number;
  /** Boylam hızı, derece/gün */
  speed: number;
  retrograde: boolean;
  /** 1–12 */
  house: number;
  /** Dünya'ya uzaklık (AU), yalnızca fiziksel cisimlerde */
  distance?: number;
  /** Deklinasyon (derece) */
  declination?: number;
}

export interface HouseData {
  system: HouseSystem;
  /** 12 elemanlı, indeks 0 = 1. ev başlangıcı (ASC) */
  cusps: number[];
  asc: number;
  mc: number;
  dsc: number;
  ic: number;
  vertex: number;
  /** Kutup enlemlerinde Placidus/Koch çözülemezse düşülen sistem */
  fallbackFrom?: HouseSystem;
}

export interface Aspect {
  a: BodyId;
  b: BodyId;
  type: AspectType;
  /** Açının ideal değeri (0, 60, 90, ...) */
  angle: number;
  /** Gerçek açısal uzaklık (0–180) */
  separation: number;
  /** İdealden sapma (derece, işaretli: + geniş, − dar) */
  orb: number;
  /** İzin verilen maksimum orb */
  maxOrb: number;
  /** Açı kesinliğe yaklaşıyor mu (applying) */
  applying: boolean;
  /** 0–1: 1 = tam açı, 0 = orb sınırında */
  strength: number;
}

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
}

export type DignityKind = 'domicile' | 'exaltation' | 'detriment' | 'fall';

export interface Dignity {
  body: PlanetId;
  kind: DignityKind;
}

export interface ChartMeta {
  /** UTC anı */
  utc: Date;
  /** Jülyen günü (UT) */
  jd: number;
  /** Gerçek ekliptik eğikliği (derece) */
  obliquity: number;
  /** Yerel yıldız zamanı (derece, 0–360) — RAMC */
  ramc: number;
  /** Greenwich görünür yıldız zamanı (derece) */
  gast: number;
  /** Gündüz doğumu mu (Güneş ufkun üstünde) */
  isDayChart: boolean;
  /** Kullanılan saat dilimi ve o andaki UTC farkı (dakika) */
  timeZone: string;
  utcOffsetMinutes: number;
}

export interface NatalChart {
  input: BirthInput;
  options: Required<Pick<ChartOptions, 'houseSystem' | 'nodeType'>>;
  meta: ChartMeta;
  /** Sıralı gezegen listesi (Güneş → Lilith) */
  planets: BodyPosition[];
  /** ASC, MC, DSC, IC, Vertex, Şans Noktası */
  points: BodyPosition[];
  houses: HouseData;
  aspects: Aspect[];
  elements: ElementBalance;
  modalities: ModalityBalance;
  dignities: Dignity[];
  /** Haritanın hâkim burcu / elementi vb. kısa özet için */
  summary: ChartSummary;
}

export interface ChartSummary {
  sunSign: number;
  moonSign: number;
  ascSign: number;
  dominantElement: Element;
  dominantModality: Modality;
  /** Retro gezegen sayısı */
  retrogradeCount: number;
}

/** Transit hesabı çıktısı */
export interface TransitAspect extends Aspect {
  /** a = transit cismi, b = natal cismi */
  transitBody: BodyId;
  natalBody: BodyId;
  /** Transit cismin bulunduğu natal ev */
  transitHouse: number;
}

export interface TransitReport {
  date: Date;
  transitPositions: BodyPosition[];
  aspects: TransitAspect[];
}

export interface SynastryAspect extends Aspect {
  /** a = 1. kişi, b = 2. kişi */
  personA: BodyId;
  personB: BodyId;
  /** −1 … +1: uyum katkısı (negatif = gerilim) */
  weight: number;
}

export interface SynastryReport {
  aspects: SynastryAspect[];
  /** 0–100 genel uyum skoru */
  score: number;
  /** Kategorilere göre alt skorlar */
  categories: {
    love: number;
    communication: number;
    harmony: number;
    passion: number;
    stability: number;
  };
  /** A'nın gezegenleri B'nin hangi evine düşüyor */
  housesAinB: Record<PlanetId, number>;
  housesBinA: Record<PlanetId, number>;
}
