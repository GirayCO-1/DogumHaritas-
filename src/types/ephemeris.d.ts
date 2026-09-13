declare module 'ephemeris' {
  export interface EphemerisObserved {
    name: string;
    apparentLongitudeDms360?: string;
    apparentLongitudeDd: number;
    geocentricDistanceKm?: number;
    raw?: {
      position?: {
        apparentLongitude?: number;
        apparentLatitude?: number;
        trueGeocentricDistance?: number;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
  }

  export interface EphemerisResult {
    date: Record<string, unknown>;
    observer: Record<string, unknown>;
    observed: Record<string, EphemerisObserved>;
  }

  export function getPlanet(
    name: string,
    date: Date,
    longitude: number,
    latitude: number,
    height: number,
  ): EphemerisResult;

  export function getAllPlanets(
    date: Date,
    longitude: number,
    latitude: number,
    height: number,
  ): EphemerisResult;
}
