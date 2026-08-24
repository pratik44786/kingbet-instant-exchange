# KINGBET EXCHANGE — Crypto Investment Platform

A premium, dark-luxury crypto investment platform built with React, TypeScript, Vite and Lovable Cloud (Supabase). Users deposit USDT/USDC, activate investment plans, earn fortnightly profit payouts, and grow earnings through referrals.

Live: https://kingbetexchange.click

---

## Features

### Investor Experience
- Landing page with plan highlights, live market ticker (CoinGecko) and recent payouts ticker
- Investment plans starting at **$10 USDT** with a 90-day lock-in
- Built-in investment calculator with projected growth chart
- Dashboard: active investments, portfolio growth chart, earnings and transaction history
- Crypto deposits with QR codes, per-network addresses and network-mismatch warnings
- Withdrawals gated by KYC, processed through secure server-side functions
- Referral program with downline table, join dates and commission tracking
- Profile management, avatar upload, real-time notifications

### Compliance & Security
- KYC submission flow with document storage
- 2FA / MFA via Lovable Cloud auth
- Legal pages: Terms, Privacy, AML, Risk Disclosure
- Role-based access: user, admin, superadmin (roles stored in a dedicated table)
- Row Level Security on every table; all financial writes go through Edge Functions
- Atomic approval functions with row locking to prevent duplicate deposit/withdrawal credits

### Admin Console
- Deposit and withdrawal approvals
- Investment plan management
- Deposit wallet address management
- KYC review and user management
- Company/branding settings (names, contacts, footer content)

### Growth & SEO
- Per-page metadata, canonical URLs and JSON-LD via a shared `Seo` component
- Blog with related-post internal linking
- Auto-generated `sitemap.xml` and `rss.xml`, plus IndexNow pings on build
- Google Search Console verification, `llms.txt`, exit-intent lead capture
- PWA manifest and icons; Capacitor setup for Android APK export

---

## Tech Stack

- **Frontend**: React 18 + TypeScript 5
- **Build**: Vite 5
- **Styling**: Tailwind CSS 3 + shadcn/ui (Radix primitives)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Backend**: Lovable Cloud — Postgres, Auth, Storage, Edge Functions
- **SEO**: react-helmet-async
- **Mobile**: Capacitor 8 (Android)

---

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:8080`.

### Build

```bash
npm run type-check
npm run build
npm run preview
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start dev server (regenerates RSS first) |
| `npm run build` | Production build + RSS/IndexNow ping |
| `npm run build:dev` | Development-mode build |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run type-check` | TypeScript check |

---

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── layout/             # Header, Footer, Logo, MarketTicker, SiteLayout
│   ├── Seo.tsx
│   ├── ExitIntentModal.tsx
│   ├── RecentPayoutsTicker.tsx
│   └── StickySignupCta.tsx
├── context/AuthContext.tsx
├── hooks/                  # useWallet, useNotifications, useCompanySettings
├── integrations/supabase/  # auto-generated client & types
├── data/blog.ts            # blog source of truth
├── pages/                  # Home, Plans, Dashboard, Deposit, Withdraw,
│                           # Referral, KYC, Security, Profile, Admin,
│                           # Blog, BlogPost, FAQ, About, Legal, Auth pages
└── utils/validation.ts

supabase/functions/         # create-investment, create-withdrawal,
                            # profit-payout, admin-actions
scripts/generate-rss.ts     # RSS generation + IndexNow ping
public/                     # sitemap.xml, robots.txt, rss.xml, icons, manifest
```

---

## Backend Overview

Core tables: `profiles`, `user_roles`, `wallets`, `investment_plans`, `investments`, `deposits`, `withdrawals`, `transactions`, `referrals`, `kyc_submissions`, `notifications`, `deposit_addresses`, `company_settings`, `leads`.

Edge Functions:
- `create-investment` — validates plan limits and locks funds
- `create-withdrawal` — KYC + balance checks, creates a pending request
- `admin-actions` — approvals with atomic DB functions and notifications
- `profit-payout` — scheduled fortnightly profit distribution

All balance and status changes happen server-side; the client never writes to financial tables directly.

---

## Publishing

Frontend changes go live after clicking **Publish** in Lovable. Backend changes (migrations, Edge Functions) deploy immediately. Custom domains are managed in Project Settings → Domains.

---

## Notes

- Deposits and withdrawals use real crypto networks — always confirm the network before sending funds.
- Investment returns are not guaranteed; see the Risk Disclosure page.
