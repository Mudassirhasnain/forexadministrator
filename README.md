# Forex Administrator

**Institutional Macroeconomic Calendar & Volatility Intelligence Platform**  
Production Domain: [https://forexadministrator.vercel.app](https://forexadministrator.vercel.app)

Forex Administrator is a modern financial markets intelligence application built for active foreign exchange, precious metals, and commodities traders. The platform provides deterministic macroeconomic event mapping, sub-second release countdowns, multi-currency impact filtering, historical sparkline audits, and local browser timezone synchronization.

---

## 1. System Architecture

```text
Finnhub Market Data API (Server-Side Ingest Only)
       ↓
Rate-Limiting & Queueing Ingest Layer (Token Bucket + Backoff)
       ↓
Normalization & Deterministic Key Engine
       ↓
Drizzle ORM
       ↓
Neon Serverless PostgreSQL (Persistent Database)
       ↓
Next.js App Router & Server Services
       ↓
Trader UI (Local Timezone, URL Filters, Reactive Polling, Modals)
```

- **Framework**: Next.js App Router (React Server Components + interactive Client Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **Database**: Neon Serverless PostgreSQL
- **ORM & Migrations**: Drizzle ORM + Drizzle Kit
- **Upstream Feed**: Finnhub Economic Calendar REST API (strict server-side proxy)
- **Deployment Platform**: Vercel

---

## 2. Requirements

- **Node.js**: v20 or higher
- **Package Manager**: npm (v10+)
- **Database**: Neon PostgreSQL connection URL
- **Market Data**: Finnhub API Key (free or institutional tier)

---

## 3. Environment Variables

Configure your environment variables in `.env` (or in the Vercel Project Settings for production):

| Variable | Description | Secret? | Example Value |
|---|---|---|---|
| `DATABASE_URL` | Neon Serverless PostgreSQL connection string | **Yes** | `postgresql://user:pass@ep-xyz.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `FINNHUB_API_KEY` | Finnhub REST API Token | **Yes** | `c9...` |
| `AUTH_SECRET` | Secret key for JWT admin authentication and session signing | **Yes** | `random-32-character-secret` |
| `CRON_SECRET` | Secret bearer token for authenticating scheduled cron invocations | **Yes** | `cron-auth-token-4455` |
| `NEXT_PUBLIC_SITE_URL` | Canonical public site URL | No | `https://forexadministrator.vercel.app` |
| `FINNHUB_RPM_LIMIT` | Max API requests permitted per minute | No | `30` |
| `FINNHUB_MIN_REQUEST_INTERVAL_MS` | Minimum cooldown between API calls (ms) | No | `1000` |

> **Security Note:** Secrets must never be committed to source control or exposed to client browsers.

---

## 4. Local Development Setup

1. **Clone and install dependencies with npm:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Add your DATABASE_URL, AUTH_SECRET, FINNHUB_API_KEY, and CRON_SECRET
   ```

3. **Initialize the database:**
   ```bash
   # Push schema to Neon PostgreSQL
   npm run db:push

   # Seed instruments and initial research dossiers
   npm run db:seed
   ```

4. **Launch development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run test suite:**
   ```bash
   npm test
   ```

---

## 5. Available Scripts

- `npm run dev`: Starts Next.js development server on port 3000
- `npm run build`: Compiles production Next.js build
- `npm run start`: Starts production server
- `npm run lint`: Performs TypeScript compilation checks
- `npm test`: Runs Node.js test suite for calendar filter & relevance engines
- `npm run db:generate`: Generates Drizzle migration files
- `npm run db:push`: Applies schema changes directly to Neon PostgreSQL
- `npm run db:seed`: Seeds instruments, initial articles, and admin accounts into PostgreSQL

---

## 6. Production Deployment (Vercel)

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. In **Build and Output Settings**, Vercel automatically detects Next.js.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`
   - `FINNHUB_API_KEY`
   - `AUTH_SECRET`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_SITE_URL` = `https://forexadministrator.vercel.app`
   - `FINNHUB_RPM_LIMIT` = `30`
   - `FINNHUB_MIN_REQUEST_INTERVAL_MS` = `1000`
5. Click **Deploy**.
6. Set up periodic cron triggers targeting `/api/cron/sync-calendar` with `Authorization: Bearer <CRON_SECRET>`.
