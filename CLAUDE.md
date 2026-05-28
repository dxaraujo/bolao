# CLAUDE.md

Guia para agentes (Claude Code) trabalhando neste repositório.

> **Antes de mexer num módulo, leia a spec dele em [`.spec/`](./.spec/README.md)** (contrato formal: requisitos, modelo de dados, regras, casos de borda). Documentação narrativa (arquitetura, setup, decisões) em [`docs/`](./docs/README.md). Este CLAUDE.md cobre só o necessário para se orientar.

## Visão geral

Monorepo pnpm da aplicação **Bolão da Copa 2026** — app privado para amigos/família apostarem nos jogos. Não é produto público; sem necessidade de moderação, anti-fraude ou escala massiva.

```
.
├── backend/    NestJS 10 + TS 5 + Mongoose 8 (MongoDB)
├── frontend/   React 19 + Vite 7 + TS 5 + Tailwind v4 + shadcn/ui (PWA mobile-first)
└── shared/     @bolao/shared — enums, DTOs, funções puras compartilhadas
```

## Stack

**Backend** — NestJS 10, Mongoose 8, Google OAuth + JWT, `class-validator` via `ValidationPipe` global, `@nestjs/schedule`, Swagger em `/api/docs`, Helmet.

**Frontend** — React 19, React Router v7, TanStack Query v5, Radix UI primitives, Tailwind, zod, Recharts, `date-fns`, `sonner`, `lucide-react`, `vite-plugin-pwa`.

**Shared** — `@bolao/shared`: enums (`MatchStage`, `MatchStatus`, `StageState`), constantes (`SCORING_RULES`, `STAGE_DEADLINES`, `STAGE_EXPECTED_MATCHES`), funções puras (`calculateBetScore`, `getStageState`, `compareLeaderboardRows`, `mapExternalStatus`, `tlaToFlagEmoji`), DTOs.

## Comandos (rodar da raiz)

```
pnpm install              # instala tudo
pnpm dev                  # backend + frontend em paralelo
pnpm dev:backend          # só backend (Nest watch, :3000)
pnpm dev:frontend         # só frontend (Vite, :5173)
pnpm build                # build de todos os workspaces
pnpm build:shared         # rebuild só do shared (necessário se mudou contrato)
docker compose up -d mongo  # sobe Mongo local; URI default mongodb://localhost/bolao_v2
```

Type-check: `pnpm --filter ./backend typecheck` / `pnpm --filter ./frontend typecheck`.
Lint: `pnpm --filter ./backend lint` / `pnpm --filter ./frontend lint`.

## Estrutura do backend (`backend/src/`)

Módulos:

- `auth/` — Google ID token → JWT. `JwtAuthGuard` global; rotas públicas usam `@Public()`.
- `user/` — CRUD identidade, sem side-effects em Bet
- `media/` — download de avatares/escudos
- `team/` — import + `flagEmoji` preferencial sobre `crest`
- `stage/` — config + estado derivado (`LOCKED/OPEN/CLOSED`), sem `BlockStagesTask`
- `match/` — import (TBD são skipadas), workflow de status com warnings (`isCanonicalTransition`)
- `bet/` — esparso, validado, `ActiveParticipantGuard`, semântica tudo-ou-nada
- `leaderboard/` — singleton + stats derivadas (substitui antigos `ranking/` e `stats/`)
- `system-state/` — timestamps de sync (substitui antigo `config/`)
- `schedule/` — 1 cron: `MatchSyncTask` (`*/5 * * * *`) + `OnApplicationBootstrap` (rebaixa times + matches na subida). Faz import + rebuild de leaderboard quando há mudanças.
- `health/`, `common/`

Rotas: `/auth/google`, `/healthcheck`, `/api/{user,team,stage,match,bet,leaderboard,system}`.

Env obrigatórias: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `FOOTBALL_DATA_API_URL`, `FOOTBALL_DATA_API_KEY`. Opcionais: `PORT` (3000), `MONGODB_URI` (default `mongodb://localhost/bolao_v2`), `JWT_EXPIRES_IN` (30d). Ver `backend/.env.example`.

## Estrutura do frontend (`frontend/src/`)

```
App.tsx, main.tsx, router.tsx
components/
  ui/         primitives shadcn
  layout/     AppShell, Header (badges Espectador/Admin), BottomNav (esconde Apostas se !isActive), AuthenticatedLayout
  shared/     TeamCrest (emoji preferencial), EmptyState, LiveDot, StageBadge
  guards/     ProtectedRoute, PublicOnlyRoute, AdminRoute, ActiveRoute
features/     auth, home, bets, bolao, ranking, stats, admin
hooks/        useMe, useStages, useMatches, useBets, useLeaderboard, useSystemState, useAdmin
lib/          api (fetch + JWT), cn, format, scoring (resultKindOf, SCORING_TABLE), ranking, stage, assets
providers/    ThemeProvider, AuthProvider, QueryProvider
```

Var obrigatória: `VITE_GOOGLE_CLIENT_ID`.

## Modelos v2 (resumo)

- `User { googleSub, name, givenName?, email, picture?, avatar?, isAdmin, isActive, participationChangedAt? }`
- `Team { footballDataId, name, shortName, tla, flagEmoji?, crest?, externalLastUpdated }`
- `Stage { code, order, deadline, expectedMatchCount }`  — estado derivado
- `Match { footballDataId, utcDate, status, stage(FK), group?, homeTeam(FK), awayTeam(FK), score?, externalLastUpdated }`
- `Bet { user(FK), match(FK), score: {home, away} }` — esparso, unique {user,match}
- `Leaderboard` singleton, recomputado pelo `LeaderboardService.rebuild()`
- `SystemState` singleton com timestamps de sync

## Convenções

- **Tipos cruzando frontend↔backend** vêm de `@bolao/shared`. Não duplicar; não usar `any` na fronteira.
- **Funções puras** (cálculo de score, estado de fase, de-para de status) vivem em `@bolao/shared` — frontend e backend usam a mesma implementação.
- **Terminologia do domínio (PT-BR)** na UI: palpite, partida, fase, ranking. Identificadores técnicos em inglês.
- **Mudou contrato no `shared/`?** Rodar `pnpm build:shared`.
- **Não criar arquivos `.md` novos** a menos que pedido explicitamente.
- **`isActive` = pagante.** Espectadores logam, veem tudo, mas não palpitam nem entram no leaderboard.
- **LIVE pontua** — leaderboard atualiza em tempo real.

### Especificações formais (`.spec/`)

Contrato por módulo (requisitos RF/RN, modelo de dados, endpoints, casos de borda). Índice em [`.spec/README.md`](./.spec/README.md):

- `auth` · `user` · `team` · `stage` · `match` · `bet` · `scoring` · `leaderboard` · `sync` · `frontend`

### Documentação narrativa (`docs/`)

- [`docs/README.md`](./docs/README.md) — índice
- [`docs/arquitetura.md`](./docs/arquitetura.md) — monorepo, camadas, fluxo de dados
- [`docs/dominio.md`](./docs/dominio.md) — glossário, princípio norteador, fluxos transversais, espectadores
- [`docs/desenvolvimento.md`](./docs/desenvolvimento.md) — setup local
- [`docs/v2-plan.md`](./docs/v2-plan.md) — plano e decisões do refactor

> Endpoints: a referência viva é o Swagger em `/api/docs`; o contrato por módulo está nas specs.
