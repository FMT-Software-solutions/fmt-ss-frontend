export interface AnalyticsTally {
  key: string;
  count: number;
}

export interface AnalyticsPoint {
  date: string;
  views: number;
  uniques: number;
}

export interface AnalyticsReport {
  unavailable: boolean;
  from: string;
  to: string;
  summary: {
    views: number;
    uniques: number;
    sessions: number;
    countries: number;
    viewsPerSession: number;
  };
  timeseries: AnalyticsPoint[];
  pages: AnalyticsTally[];
  countries: AnalyticsTally[];
  referrers: AnalyticsTally[];
  devices: AnalyticsTally[];
  browsers: AnalyticsTally[];
}

/** ISO-3166 alpha-2 to a readable name for the countries we actually see. */
const COUNTRY_NAMES: Record<string, string> = {
  GH: 'Ghana',
  NG: 'Nigeria',
  US: 'United States',
  GB: 'United Kingdom',
  CA: 'Canada',
  DE: 'Germany',
  FR: 'France',
  NL: 'Netherlands',
  ZA: 'South Africa',
  KE: 'Kenya',
  CI: "Côte d'Ivoire",
  TG: 'Togo',
  BJ: 'Benin',
  BF: 'Burkina Faso',
  IN: 'India',
  CN: 'China',
  AE: 'United Arab Emirates',
  AU: 'Australia',
  IE: 'Ireland',
  IT: 'Italy',
  ES: 'Spain',
};

export function countryName(code: string): string {
  if (code === 'Unknown') return 'Unknown';
  return COUNTRY_NAMES[code] ?? code;
}

export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return '🌍';
  return String.fromCodePoint(
    ...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65),
  );
}
