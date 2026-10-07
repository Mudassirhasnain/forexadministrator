import type { Instrument, EconomicEvent } from '@/db/schema';

export interface RelevanceResult {
  isRelevant: boolean;
  score: number; // 1-100
  reason: string;
}

export function computeInstrumentRelevance(
  instrument: Pick<Instrument, 'id' | 'symbol' | 'category' | 'baseCurrency' | 'quoteCurrency'>,
  event: Pick<EconomicEvent, 'eventName' | 'currency' | 'countryCode' | 'impact'>
): RelevanceResult {
  const normEventName = (event.eventName || '').toLowerCase();
  const eventCurrency = (event.currency || '').toUpperCase();
  const baseCurrency = (instrument.baseCurrency || '').toUpperCase();
  const quoteCurrency = (instrument.quoteCurrency || '').toUpperCase();
  const impactMultiplier = event.impact === 'high' ? 1.0 : event.impact === 'medium' ? 0.85 : 0.7;

  // 1. Direct Base or Quote Currency Match
  if (eventCurrency === baseCurrency) {
    return {
      isRelevant: true,
      score: Math.round(95 * impactMultiplier),
      reason: `Direct base currency (${baseCurrency}) macro release`,
    };
  }

  if (eventCurrency === quoteCurrency) {
    // If it's a metal, energy, or crypto quoted in USD
    if (instrument.category === 'Metals') {
      const isMetalSpecific =
        normEventName.includes('gold') ||
        normEventName.includes('bullion') ||
        normEventName.includes('precious metal') ||
        normEventName.includes('silver') ||
        normEventName.includes('reserve');

      const isKeyDollarDriver =
        normEventName.includes('cpi') ||
        normEventName.includes('fomc') ||
        normEventName.includes('fed') ||
        normEventName.includes('rate decision') ||
        normEventName.includes('payroll') ||
        normEventName.includes('inflation') ||
        normEventName.includes('treasury');

      const score = isMetalSpecific
        ? 100
        : isKeyDollarDriver
          ? Math.round(92 * impactMultiplier)
          : Math.round(80 * impactMultiplier);

      return {
        isRelevant: true,
        score,
        reason: isMetalSpecific
          ? `Precious metals specific development`
          : `Dollar valuation and real-yield shock impact on bullion`,
      };
    }

    if (instrument.category === 'Energy') {
      const isOilSpecific =
        normEventName.includes('crude') ||
        normEventName.includes('oil') ||
        normEventName.includes('petroleum') ||
        normEventName.includes('eia') ||
        normEventName.includes('opec') ||
        normEventName.includes('energy') ||
        normEventName.includes('gas');

      const score = isOilSpecific ? 100 : Math.round(80 * impactMultiplier);

      return {
        isRelevant: true,
        score,
        reason: isOilSpecific
          ? `Direct global energy and petroleum supply/demand event`
          : `US macroeconomic liquidity and dollar pricing factor`,
      };
    }

    if (instrument.category === 'Crypto') {
      const isCryptoSpecific =
        normEventName.includes('crypto') ||
        normEventName.includes('bitcoin') ||
        normEventName.includes('digital asset') ||
        normEventName.includes('sec') ||
        normEventName.includes('cftc');

      const score = isCryptoSpecific ? 100 : Math.round(75 * impactMultiplier);

      return {
        isRelevant: true,
        score,
        reason: isCryptoSpecific
          ? `Cryptocurrency and digital asset policy catalyst`
          : `US dollar liquidity conditions impacting risk assets`,
      };
    }

    return {
      isRelevant: true,
      score: Math.round(90 * impactMultiplier),
      reason: `Direct quote currency (${quoteCurrency}) economic release`,
    };
  }

  // 2. Cross-category correlations
  // e.g., Canadian Dollar (CAD) and Crude Oil (WTI, BRENT)
  if (
    (instrument.id === 'WTI_USD' || instrument.id === 'BRENT_USD') &&
    eventCurrency === 'CAD' &&
    normEventName.includes('energy')
  ) {
    return {
      isRelevant: true,
      score: Math.round(75 * impactMultiplier),
      reason: 'Major North American petroleum exporter correlation',
    };
  }

  // Global OPEC meetings affecting WTI & BRENT regardless of event currency
  if (
    (instrument.id === 'WTI_USD' || instrument.id === 'BRENT_USD') &&
    (normEventName.includes('opec') || normEventName.includes('crude'))
  ) {
    return {
      isRelevant: true,
      score: 100,
      reason: 'Global crude supply policy driver',
    };
  }

  return {
    isRelevant: false,
    score: 0,
    reason: 'No direct exposure found',
  };
}
