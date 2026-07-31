# MeFamous

**Instant Social Authority, Engineered for Impact.**

A premium SMM (social media marketing) reseller SaaS — Next.js 15 + Supabase.

## Status: Phase 1 — Foundation ✅

This repo is being built incrementally, in the order below. Each phase is complete and
functional on its own — no TODOs, no stubs — before the next one starts.

- [x] **Phase 1 — Foundation**: project scaffold, Tailwind + brand tokens, Supabase
      client/server helpers, middleware, root layout, landing hero, footer/header
      (with support contact + credit line), PWA manifest hookup point.
- [ ] Phase 2 — Authentication (email/password, Google login, RBAC, protected routes)
- [ ] Phase 3 — Wallet & Payments (Korapay + crypto, SQL migrations, ledger)
- [ ] Phase 4 — Owlet API integration (typed proxy, order calculator)
- [ ] Phase 5 — Customer dashboard
- [ ] Phase 6 — Admin dashboard
- [ ] Phase 7 — Full landing page, SEO, PWA assets
- [ ] Phase 8 — Docker, deployment config, polish

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Korapay, Owlet, crypto keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion,
  Lucide Icons, React Hook Form + Zod, TanStack Query, Zustand, React Hot Toast, Recharts
- **Backend**: Next.js Route Handlers, Supabase (Auth, Postgres, RLS, Storage, Realtime)
- **Payments**: Korapay (card/bank/virtual account) + manual-verified crypto (BTC, ETH,
  USDT TRC20/ERC20, LTC, SOL)
- **Provider**: Owlet SMM API, proxied server-side — the API key never reaches the client

## Project structure

```
app/                  # App Router pages, layouts, route handlers
components/
  layout/             # Header, public Footer, DashboardFooter, (topbar in Phase 5)
  ui/                 # Reusable primitives (added as needed per phase)
lib/
  constants/brand.ts  # Brand colors, copy, support contact, footer credit — single source of truth
  supabase/           # Browser client, server client, admin client
types/                # Shared TypeScript types + generated Database types
middleware.ts         # Session refresh + route protection (customer/admin)
```

## Design notes

- Brand colors, the support contact details, and the footer credit line all live in
  `lib/constants/brand.ts`. Update them there once — every component reads from it.
- **Authenticated views stay promotion-free.** `Footer` (marketing) is used only on public
  routes; `DashboardFooter` is used inside `/dashboard` and `/admin` and intentionally omits
  all marketing content — just support contact + credit line.

## Support

- WhatsApp: +234 901 853 6491
- Email: Trotskybuilds@gmail.com

---
Built By Trotskybuilds Technology - We build Ideas
