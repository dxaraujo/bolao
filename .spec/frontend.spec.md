# Especificação — Frontend (`frontend`)

- **ID:** SPEC-FRONTEND
- **Frontend:** `frontend/src/` (`router.tsx`, `components/guards/ProtectedRoute.tsx`, `components/layout/`, `features/`, `hooks/`, `lib/`, `providers/`)
- **Shared:** todos os DTOs de `@bolao/shared`
- **Visão geral:** [`README.md`](./README.md) (arquitetura, frontend)

## 1. Objetivo

SPA mobile-first (PWA) que consome a API REST, encapsula estado de servidor em hooks TanStack Query e aplica autorização por rota coerente com os guards do backend.

## 2. Rotas e guards (`router.tsx`)

Rotas autenticadas aninhadas sob `/` via `AuthenticatedLayout`.

| Path | Guard | Tela |
|---|---|---|
| `/login` | `PublicOnlyRoute` | `LoginScreen` |
| `/` | `ProtectedRoute` | `HomeScreen` |
| `/apostas` | `ActiveRoute` | `BetsScreen` |
| `/bolao` | `ProtectedRoute` | `BolaoScreen` |
| `/ranking` | `ProtectedRoute` | `RankingScreen` |
| `/stats` | `ProtectedRoute` | `StatsScreen` |
| `/admin` | `AdminRoute` | `AdminScreen` |
| `*` | — | redirect → `/` |

Guards (todos em `components/guards/ProtectedRoute.tsx`):
- **RF-FE-1** — `PublicOnlyRoute`: logado → redireciona para `/`.
- **RF-FE-2** — `ProtectedRoute`: sem sessão → `/login`.
- **RF-FE-3** — `ActiveRoute`: exige sessão **e** `isActive` (espectador redirecionado).
- **RF-FE-4** — `AdminRoute`: exige sessão **e** `isAdmin` (JWT decodificado).

## 3. Estado de servidor (hooks `src/hooks/`)

`useMe`, `useStages`, `useMatches`, `useBets`, `useLeaderboard`, `useSystemState`, `useAdmin`, `useWatchResults`, `usePwaInstall`. Cada um usa `useQuery`/`useMutation` com `queryKey` estável e invalidação seletiva.

- **RF-FE-5** — `useWatchResults`: poll de `/api/system/state` a cada `30_000ms` (e em foco/background) quando autenticado; ao mudar `leaderboardRebuildAt`, toast + invalida `['bets']`, `['leaderboard']`, `['matches']`, `['stages']`.
- **RF-FE-6** — Mutações admin (`useAdmin`) invalidam as queries afetadas (ex.: update de usuário → `['admin','users']`; update de stage → `['stages']` + `['admin','stage-readiness']`).

## 4. Camada de API (`lib/api.ts`)

- **RF-FE-7** — Anexa `Authorization: Bearer <token>` quando há sessão.
- **RF-FE-8** — Trata o envelope `{ data }` / `{ errors }` (`ApiResponse<T>`, `isApiError`).
- **RF-FE-9** — Dev server faz proxy de `/api`, `/auth`, `/healthcheck` para `:3000` (`vite.config.ts`).

## 5. Regras de negócio (UX coerente com o domínio)

- **RN-FE-1** — Header mostra badge **"Espectador"** (`!isActive`) / **"Admin"** (`isAdmin`).
- **RN-FE-2** — `BottomNav` esconde a aba **Apostas** para espectadores.
- **RN-FE-3** — Renderização de time prefere `flagEmoji` sobre `crest` (`TeamCrest`).
- **RN-FE-4** — Preview de pontos usa `lib/scoring` (mesma lógica de `@bolao/shared`) — nunca recalcula pontos à mão.
- **RN-FE-5** — Terminologia PT-BR (palpite, partida, fase, ranking); identificadores técnicos em inglês.
- **RN-FE-6** — Bolão (`/bolao`) só exibe fases CLOSED (vem assim do backend).

## 6. PWA

- **RF-FE-10** — `vite-plugin-pwa` + `workbox-window`; `usePwaInstall` gerencia o prompt de instalação.

## 7. Casos de borda

- **CB-FE-1** — Token expirado → API retorna `401`; sessão é limpa e usuário cai em `/login`.
- **CB-FE-2** — Espectador tenta `/apostas` por URL → `ActiveRoute` redireciona.
- **CB-FE-3** — Várias abas abertas: `useWatchResults` invalida em todas ao detectar novo `leaderboardRebuildAt`.

## 8. Dependências

- Todas as specs de backend (contratos via `@bolao/shared`), [sync](./sync.spec.md) (watch de resultados).
