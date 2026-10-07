import type { Instrument, BlogPost } from './schema';

export const INITIAL_INSTRUMENTS: Array<Omit<Instrument, 'createdAt' | 'updatedAt'>> = [
  // METALS
  {
    id: 'XAU_USD',
    symbol: 'XAU/USD',
    displayName: 'Spot Gold / US Dollar',
    category: 'Metals',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'XAG_USD',
    symbol: 'XAG/USD',
    displayName: 'Spot Silver / US Dollar',
    category: 'Metals',
    baseCurrency: 'XAG',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 2,
  },
  // ENERGY
  {
    id: 'WTI_USD',
    symbol: 'WTI/USD',
    displayName: 'WTI Crude Oil / US Dollar',
    category: 'Energy',
    baseCurrency: 'WTI',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'BRENT_USD',
    symbol: 'BRENT/USD',
    displayName: 'Brent Crude Oil / US Dollar',
    category: 'Energy',
    baseCurrency: 'BRENT',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 4,
  },
  // MAJOR FOREX
  {
    id: 'EUR_USD',
    symbol: 'EUR/USD',
    displayName: 'Euro / US Dollar',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'GBP_USD',
    symbol: 'GBP/USD',
    displayName: 'British Pound / US Dollar',
    category: 'Forex',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'USD_JPY',
    symbol: 'USD/JPY',
    displayName: 'US Dollar / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 7,
  },
  {
    id: 'USD_CHF',
    symbol: 'USD/CHF',
    displayName: 'US Dollar / Swiss Franc',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    isActive: true,
    sortOrder: 8,
  },
  {
    id: 'AUD_USD',
    symbol: 'AUD/USD',
    displayName: 'Australian Dollar / US Dollar',
    category: 'Forex',
    baseCurrency: 'AUD',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 9,
  },
  {
    id: 'NZD_USD',
    symbol: 'NZD/USD',
    displayName: 'New Zealand Dollar / US Dollar',
    category: 'Forex',
    baseCurrency: 'NZD',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'USD_CAD',
    symbol: 'USD/CAD',
    displayName: 'US Dollar / Canadian Dollar',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'CAD',
    isActive: true,
    sortOrder: 11,
  },
  // CROSSES & EXOTICS
  {
    id: 'EUR_GBP',
    symbol: 'EUR/GBP',
    displayName: 'Euro / British Pound',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'GBP',
    isActive: true,
    sortOrder: 12,
  },
  {
    id: 'EUR_JPY',
    symbol: 'EUR/JPY',
    displayName: 'Euro / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 13,
  },
  {
    id: 'GBP_JPY',
    symbol: 'GBP/JPY',
    displayName: 'British Pound / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'GBP',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 14,
  },
  {
    id: 'EUR_CHF',
    symbol: 'EUR/CHF',
    displayName: 'Euro / Swiss Franc',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'CHF',
    isActive: true,
    sortOrder: 15,
  },
  {
    id: 'AUD_JPY',
    symbol: 'AUD/JPY',
    displayName: 'Australian Dollar / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'AUD',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 16,
  },
  {
    id: 'CAD_JPY',
    symbol: 'CAD/JPY',
    displayName: 'Canadian Dollar / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'CAD',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 17,
  },
  {
    id: 'NZD_JPY',
    symbol: 'NZD/JPY',
    displayName: 'New Zealand Dollar / Japanese Yen',
    category: 'Forex',
    baseCurrency: 'NZD',
    quoteCurrency: 'JPY',
    isActive: true,
    sortOrder: 18,
  },
  {
    id: 'USD_CNY',
    symbol: 'USD/CNY',
    displayName: 'US Dollar / Chinese Yuan',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'CNY',
    isActive: true,
    sortOrder: 19,
  },
  {
    id: 'USD_SGD',
    symbol: 'USD/SGD',
    displayName: 'US Dollar / Singapore Dollar',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'SGD',
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'USD_HKD',
    symbol: 'USD/HKD',
    displayName: 'US Dollar / Hong Kong Dollar',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'HKD',
    isActive: true,
    sortOrder: 21,
  },
  {
    id: 'USD_NOK',
    symbol: 'USD/NOK',
    displayName: 'US Dollar / Norwegian Krone',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'NOK',
    isActive: true,
    sortOrder: 22,
  },
  {
    id: 'USD_SEK',
    symbol: 'USD/SEK',
    displayName: 'US Dollar / Swedish Krona',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'SEK',
    isActive: true,
    sortOrder: 23,
  },
  {
    id: 'USD_TRY',
    symbol: 'USD/TRY',
    displayName: 'US Dollar / Turkish Lira',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'TRY',
    isActive: true,
    sortOrder: 24,
  },
  {
    id: 'USD_MXN',
    symbol: 'USD/MXN',
    displayName: 'US Dollar / Mexican Peso',
    category: 'Forex',
    baseCurrency: 'USD',
    quoteCurrency: 'MXN',
    isActive: true,
    sortOrder: 25,
  },
  {
    id: 'EUR_AUD',
    symbol: 'EUR/AUD',
    displayName: 'Euro / Australian Dollar',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'AUD',
    isActive: true,
    sortOrder: 26,
  },
  {
    id: 'EUR_CAD',
    symbol: 'EUR/CAD',
    displayName: 'Euro / Canadian Dollar',
    category: 'Forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'CAD',
    isActive: true,
    sortOrder: 27,
  },
  // CRYPTO
  {
    id: 'BTC_USD',
    symbol: 'BTC/USD',
    displayName: 'Bitcoin / US Dollar',
    category: 'Crypto',
    baseCurrency: 'BTC',
    quoteCurrency: 'USD',
    isActive: true,
    sortOrder: 28,
  },
];

export const INITIAL_BLOG_POSTS: Array<Omit<BlogPost, 'createdAt' | 'updatedAt'>> = [
  {
    id: 'blog-1',
    title: 'Navigating High-Impact CPI Prints: A Quantitative Framework for FX Traders',
    slug: 'navigating-high-impact-cpi-prints-fx-framework',
    excerpt:
      'Understanding why headline vs. core divergence drives sharp post-release repricing across dollar pairs, yields, and bullion.',
    contentMarkdown: `### The Mechanics of Inflation Surprises

When the US Consumer Price Index (CPI) crosses the tape, institutional desks do not react merely to the headline month-over-month number. The immediate order flow is governed by three interlinked vectors:

1. **The Core vs. Headline Spread**: Energy volatility frequently distorts headline numbers. Algorithmic execution engines dissect the core figure (excluding food and energy) to ascertain the underlying sticky momentum.
2. **Supercore Inflation (Services Ex-Shelter)**: Federal Reserve policymakers have repeatedly emphasized wage-sensitive non-housing services. A deceleration here signals genuine monetary transmission.
3. **Short-Dated Real Yield Movements**: The 2-year US Treasury yield adjusts within milliseconds. Gold (XAU/USD) and high-beta currencies (AUD/USD, GBP/USD) trade inversely to this instantaneous yield shock.

### Pre-Release Risk Management

Traders entering the 08:30 EST window must calculate spread widening and slippage buffers. During tier-one releases, liquidity providers widen spreads up to 5x standard quoting bounds. Executing limit orders rather than stop-market orders prevents toxic fills during the initial price discovery phase.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Marcus Vance, Head of Macro Strategy',
    status: 'published',
    publishedAt: new Date('2026-10-01T12:00:00Z'),
    seoTitle: 'Navigating High-Impact CPI Prints | Forex Administrator Research',
    seoDescription:
      'A quantitative macro guide to trading US Consumer Price Index prints, yield adjustments, and gold volatility.',
  },
  {
    id: 'blog-2',
    title: 'Gold and Real Yields: Why XAU/USD Reacts to FOMC Projections',
    slug: 'gold-and-real-yields-fomc-reaction',
    excerpt:
      'Analyzing the structural relationship between Federal Reserve terminal rate expectations, TIPS yields, and precious metals positioning.',
    contentMarkdown: `### The Intrinsic Yield Disadvantage of Bullion

Gold generates zero nominal coupon. Consequently, its opportunity cost is represented by real yields specifically 10-year Treasury Inflation-Protected Securities (TIPS).

When the Federal Open Market Committee (FOMC) delivers an unexpected hawkish hold or upgrades its dot-plot trajectory, real rates jump. Gold instantly experiences algorithmic liquidation. Conversely, when economic event prints illustrate disinflation, downward real rate shifts unlock capital flows into bullion.

### Key Release Indicators to Monitor for Gold Traders

- **US Non-Farm Payrolls (NFP)**: Average Hourly Earnings dictate wage pressure assumptions.
- **US Core PCE Price Index**: The Fed's preferred inflation yardstick.
- **FOMC Statement & Press Conference**: Dot plot distribution and Chair forward guidance.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Elena Rostova, Senior Commodities Analyst',
    status: 'published',
    publishedAt: new Date('2026-10-04T09:30:00Z'),
    seoTitle: 'Gold and Real Yields: FOMC Volatility Analysis | Forex Administrator',
    seoDescription:
      'In-depth institutional analysis of XAU/USD sensitivity to Fed dot-plots, TIPS real rates, and terminal fed funds expectations.',
  },
  {
    id: 'blog-3',
    title: 'Energy Market Shocks: Trading Crude Oil Ahead of OPEC+ and EIA Inventories',
    slug: 'energy-market-shocks-crude-oil-eia-inventories',
    excerpt:
      'A tactical guide to deciphering Wednesday EIA crude inventory releases, refinery runs, and geopolitical risk premiums on WTI and Brent.',
    contentMarkdown: `### Wednesday 10:30 AM EST: The Weekly EIA Pulse

The US Energy Information Administration (EIA) Weekly Petroleum Status Report remains the highest-velocity data event for crude oil traders. Key variables examined:

- **Commercial Crude Inventories**: Headline build or draw against expectations.
- **Strategic Petroleum Reserve (SPR) Flows**: Discerning whether government adjustments mask commercial demand changes.
- **Refinery Utilization Rates**: Gauging seasonal transitions and product demand (gasoline and distillates).
- **Implied Demand**: Weekly product supplied calculation.

When unexpected inventory builds materialize alongside softening gasoline demand, front-month futures experience sharp downward spikes that reverberate into CAD/USD and oil-sensitive currencies.`,
    coverImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    authorName: 'Liam Chen, Energy Strategist',
    status: 'published',
    publishedAt: new Date('2026-10-06T14:15:00Z'),
    seoTitle: 'Trading Crude Oil EIA Inventories & OPEC+ | Forex Administrator',
    seoDescription:
      'Mastering weekly EIA crude inventory data, refinery utilization, and global supply elasticity for WTI and Brent.',
  },
];
