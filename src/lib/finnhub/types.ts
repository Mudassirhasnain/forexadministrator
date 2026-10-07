export interface FinnhubEconomicEventRaw {
  actual: number | null;
  prev: number | null;
  country: string;
  currency?: string;
  estimate: number | null;
  event: string;
  impact: string; // 'high' | 'medium' | 'low'
  time: string; // 'YYYY-MM-DD HH:mm:ss' or ISO string
  unit: string;
}

export interface FinnhubCalendarResponse {
  economicCalendar: FinnhubEconomicEventRaw[];
}

export interface FinnhubClientConfig {
  apiKey: string;
  rpmLimit?: number;
  minIntervalMs?: number;
}
