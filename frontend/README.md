# Copabet Frontend

PWA mobile-first do bolão da Copa do Mundo 2026. React 19 + Vite 7 + TypeScript + Tailwind + shadcn/ui.

## Setup

```sh
pnpm install
cp .env.example .env  # preencher VITE_GOOGLE_CLIENT_ID
pnpm dev
```

Dev server roda em `http://localhost:5173` e faz proxy de `/api`, `/auth` e `/healthcheck` para o backend em `:3000`.

## Stack

- **React 19** + **TypeScript 5.7** + **Vite 7**
- **React Router v7** (`react-router-dom`)
- **TanStack Query v5** (`@tanstack/react-query` + devtools)
- **Tailwind** + tokens via CSS vars + `tailwindcss-animate`
- **shadcn/ui** sobre **Radix primitives** (accordion, dialog, tabs, toast, tooltip, scroll-area, progress, avatar, label, slot)
- **`react-hook-form`** + **zod** via `@hookform/resolvers`
- **`@react-oauth/google`** + **`jwt-decode`** para login
- **Recharts** para gráficos; **`lucide-react`** para ícones; **`sonner`** para toasts
- **`date-fns`** para datas
- **PWA** via `vite-plugin-pwa` + `workbox-window`

## Scripts

| Script           | O que faz                              |
|------------------|----------------------------------------|
| `pnpm dev`       | Vite dev server (`:5173`)              |
| `pnpm build`     | `tsc -b` + build de produção           |
| `pnpm preview`   | Preview do build                       |
| `pnpm typecheck` | `tsc -b --noEmit`                      |
| `pnpm lint`      | ESLint nos arquivos `.ts`/`.tsx`       |

## Variáveis de ambiente

Todas com prefixo `VITE_*` (lidas pelo Vite no client).

| Variável                | Obrigatória | Descrição                       |
|-------------------------|-------------|---------------------------------|
| `VITE_GOOGLE_CLIENT_ID` | **sim**     | Client ID do Google OAuth       |

## Estrutura

```
src/
├─ App.tsx, main.tsx, router.tsx, index.css
├─ components/
│  ├─ ui/         primitives shadcn (button, card, tabs, accordion, dialog, …)
│  ├─ layout/     AppShell, Header, BottomNav, AuthenticatedLayout
│  ├─ shared/     TeamCrest, EmptyState, LiveDot, StageBadge
│  └─ guards/     ProtectedRoute, PublicOnlyRoute
├─ features/
│  ├─ auth/       LoginScreen
│  ├─ home/       HomeScreen + HeroPosition, OpenStageBanner, MatchCard
│  ├─ bets/       BetsScreen + BetCard (form de palpites por fase)
│  ├─ bolao/      BolaoScreen + MatchAccordion, BetRow
│  ├─ ranking/    RankingScreen + Podium, RankingList, PointsChart, ScoringTable
│  ├─ stats/      StatsScreen + KpiGrid, AccuracyByUser, AccuracyByStageChart, DistributionDonut
│  └─ admin/      telas administrativas (importação, status de fases, etc.)
├─ hooks/         useMe, useStages, useMatches, useBets, useRanking, useConfig,
│                 useStats, useAdmin, useWatchResults (wrappers de React Query)
├─ lib/           api (fetch + JWT), cn, format, scoring, stage, ranking, assets
└─ providers/     ThemeProvider, AuthProvider, QueryProvider
```

## Contratos

Todos os tipos de API vêm de `@bolao/shared` (workspace package). Não há `any` na fronteira. Mudou DTO em `shared/`? Rode `pnpm build:shared` (da raiz) para o frontend recompilar contra a versão atualizada.

## Tema

Dark + light via CSS vars (`:root` / `.dark`) lidas pelo `tailwind.config.ts` com `rgb(var(--token) / <alpha-value>)`. Tokens em `src/index.css`. Provider em `providers/ThemeProvider.tsx` (persistido em `localStorage`).

## PWA

`vite-plugin-pwa` gera o service worker no build de produção. O update é coordenado via `useWatchResults` / `workbox-window`. Em dev, o SW fica desabilitado por padrão.
