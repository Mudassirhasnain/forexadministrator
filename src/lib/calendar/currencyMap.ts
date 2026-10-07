// Centralized country code to currency and nation metadata mapping

export interface CountryCurrencyMeta {
  countryCode: string;
  currency: string;
  countryName: string;
  flagEmoji: string;
}

export const COUNTRY_CURRENCY_MAP: Record<string, CountryCurrencyMeta> = {
  US: { countryCode: 'US', currency: 'USD', countryName: 'United States', flagEmoji: '🇺🇸' },
  EU: { countryCode: 'EU', currency: 'EUR', countryName: 'Eurozone', flagEmoji: '🇪🇺' },
  DE: { countryCode: 'DE', currency: 'EUR', countryName: 'Germany', flagEmoji: '🇩🇪' },
  FR: { countryCode: 'FR', currency: 'EUR', countryName: 'France', flagEmoji: '🇫🇷' },
  IT: { countryCode: 'IT', currency: 'EUR', countryName: 'Italy', flagEmoji: '🇮🇹' },
  ES: { countryCode: 'ES', currency: 'EUR', countryName: 'Spain', flagEmoji: '🇪🇸' },
  GB: { countryCode: 'GB', currency: 'GBP', countryName: 'United Kingdom', flagEmoji: '🇬🇧' },
  UK: { countryCode: 'UK', currency: 'GBP', countryName: 'United Kingdom', flagEmoji: '🇬🇧' },
  JP: { countryCode: 'JP', currency: 'JPY', countryName: 'Japan', flagEmoji: '🇯🇵' },
  CH: { countryCode: 'CH', currency: 'CHF', countryName: 'Switzerland', flagEmoji: '🇨🇭' },
  AU: { countryCode: 'AU', currency: 'AUD', countryName: 'Australia', flagEmoji: '🇦🇺' },
  NZ: { countryCode: 'NZ', currency: 'NZD', countryName: 'New Zealand', flagEmoji: '🇳🇿' },
  CA: { countryCode: 'CA', currency: 'CAD', countryName: 'Canada', flagEmoji: '🇨🇦' },
  CN: { countryCode: 'CN', currency: 'CNY', countryName: 'China', flagEmoji: '🇨🇳' },
  SG: { countryCode: 'SG', currency: 'SGD', countryName: 'Singapore', flagEmoji: '🇸🇬' },
  HK: { countryCode: 'HK', currency: 'HKD', countryName: 'Hong Kong', flagEmoji: '🇭🇰' },
  NO: { countryCode: 'NO', currency: 'NOK', countryName: 'Norway', flagEmoji: '🇳🇴' },
  SE: { countryCode: 'SE', currency: 'SEK', countryName: 'Sweden', flagEmoji: '🇸🇪' },
  TR: { countryCode: 'TR', currency: 'TRY', countryName: 'Turkey', flagEmoji: '🇹🇷' },
  MX: { countryCode: 'MX', currency: 'MXN', countryName: 'Mexico', flagEmoji: '🇲🇽' },
};

export function getCurrencyForCountry(countryCode: string): string {
  const code = (countryCode || '').toUpperCase().trim();
  if (COUNTRY_CURRENCY_MAP[code]) {
    return COUNTRY_CURRENCY_MAP[code].currency;
  }
  if (code.length === 3) {
    return code;
  }
  return 'USD';
}

export function getCountryMeta(countryCodeOrCurrency: string): CountryCurrencyMeta {
  const code = (countryCodeOrCurrency || '').toUpperCase().trim();
  if (COUNTRY_CURRENCY_MAP[code]) {
    return COUNTRY_CURRENCY_MAP[code];
  }
  const found = Object.values(COUNTRY_CURRENCY_MAP).find((m) => m.currency === code);
  if (found) {
    return found;
  }
  return {
    countryCode: code,
    currency: code.length === 3 ? code : 'USD',
    countryName: code,
    flagEmoji: '🌐',
  };
}
