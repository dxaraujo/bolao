# Copabet Frontend

Mobile-first PWA do bolão da Copa do Mundo 2026. React 19 + Vite + TypeScript + Tailwind + shadcn/ui.

## Setup

```sh
pnpm install
cp .env.example .env  # preencher VITE_GOOGLE_CLIENT_ID
pnpm dev
```

Dev server roda em `http://localhost:5173` e faz proxy de `/api`, `/auth` e `/healthcheck` para o backend em `:3000`.

## Scripts

- `pnpm dev` — Vite dev server.
- `pnpm build` — type-check + build de produção.
- `pnpm preview` — preview do build.
- `pnpm typecheck` — verifica tipos sem emitir.

## Estrutura

```
src/
├─ App.tsx, main.tsx, router.tsx
├─ components/
│  ├─ ui/         shadcn-style primitives (button, card, tabs, accordion, etc.)
│  ├─ layout/     AppShell, Header, BottomNav, AuthenticatedLayout
│  ├─ shared/     TeamCrest, EmptyState, LiveDot, StageBadge
│  └─ guards/     ProtectedRoute, PublicOnlyRoute
├─ features/
│  ├─ auth/       LoginScreen
│  ├─ home/       HomeScreen + HeroPosition, OpenStageBanner, MatchCard
│  ├─ bets/       BetsScreen + BetCard (form de palpites por fase)
│  ├─ bolao/      BolaoScreen + MatchAccordion, BetRow
│  ├─ ranking/    RankingScreen + Podium, RankingList, PointsChart, ScoringTable
│  └─ stats/      StatsScreen + KpiGrid, AccuracyByUser, AccuracyByStageChart, DistributionDonut
├─ hooks/         useMe, useStages, useMatches, useBets, useRanking, useConfig, useStats
├─ lib/           api (fetch + JWT), cn, format, scoring, stage
└─ providers/     ThemeProvider, AuthProvider, QueryProvider
```

## Contratos

Todos os tipos de API vêm de `@bolao/shared` (workspace package). Não há `any` na fronteira.

## Tema

Dark + light via CSS vars (`:root` / `.dark`) lidas pelo `tailwind.config.ts` com `rgb(var(--token) / <alpha-value>)`. Tokens em `src/index.css`.
