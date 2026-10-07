import type { FinnhubCalendarResponse, FinnhubEconomicEventRaw } from './types';

export class FinnhubClient {
  private apiKey: string;
  private rpmLimit: number;
  private minIntervalMs: number;
  private lastRequestTime: number = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || '';
    this.rpmLimit = parseInt(process.env.FINNHUB_RPM_LIMIT || '30', 10);
    this.minIntervalMs = parseInt(process.env.FINNHUB_MIN_REQUEST_INTERVAL_MS || '1000', 10);
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  private async waitForSlot(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const requiredDelay = Math.max(this.minIntervalMs, Math.ceil(60000 / this.rpmLimit));
    if (elapsed < requiredDelay) {
      const waitTime = requiredDelay - elapsed;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  public async fetchEconomicCalendar(
    from: string, // YYYY-MM-DD
    to: string // YYYY-MM-DD
  ): Promise<{ data: FinnhubEconomicEventRaw[]; fromCache?: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return {
        data: [],
        error: 'Finnhub API key is not configured (FINNHUB_API_KEY is missing).',
      };
    }

    return new Promise((resolve) => {
      this.requestQueue = this.requestQueue.then(async () => {
        let attempts = 0;
        const maxAttempts = 3;
        let backoffDelay = 1000;

        while (attempts < maxAttempts) {
          attempts++;
          try {
            await this.waitForSlot();

            const url = new URL('https://finnhub.io/api/v1/calendar/economic');
            url.searchParams.set('from', from);
            url.searchParams.set('to', to);
            url.searchParams.set('token', this.apiKey);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

            const res = await fetch(url.toString(), {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'User-Agent': 'ForexAdministrator-Ingest/1.0',
              },
              cache: 'no-store',
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));

            if (res.status === 429) {
              console.warn(
                `[FinnhubClient] Rate limit hit (429). Attempt ${attempts}/${maxAttempts}. Backing off...`
              );
              await new Promise((r) => setTimeout(r, backoffDelay));
              backoffDelay *= 2;
              continue;
            }

            if (!res.ok) {
              const errText = await res.text().catch(() => 'Unknown network error');
              console.error(`[FinnhubClient] HTTP ${res.status}: ${errText.slice(0, 100)}`);
              resolve({
                data: [],
                error: `Finnhub returned HTTP status ${res.status}`,
              });
              return;
            }

            const json = (await res.json()) as FinnhubCalendarResponse;
            if (!json || !Array.isArray(json.economicCalendar)) {
              resolve({
                data: [],
                error: 'Malformed response structure from Finnhub API.',
              });
              return;
            }

            resolve({ data: json.economicCalendar });
            return;
          } catch (err: unknown) {
            const errorMsg =
              err instanceof Error ? err.message : 'Unknown exception during Finnhub fetch';
            console.error(`[FinnhubClient] Fetch error on attempt ${attempts}:`, errorMsg);
            if (attempts >= maxAttempts) {
              resolve({
                data: [],
                error: `Failed to connect to Finnhub after ${maxAttempts} attempts: ${errorMsg}`,
              });
              return;
            }
            await new Promise((r) => setTimeout(r, backoffDelay));
            backoffDelay *= 2;
          }
        }
      });
    });
  }
}

export const finnhubClient = new FinnhubClient();
