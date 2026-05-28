# Arquitetura

## Visão geral

Aplicação cliente-servidor organizada como **monorepo pnpm** com três workspaces:

```
bolao/
├── backend/    NestJS 10 + Mongoose 8 + MongoDB
├── frontend/   React 19 + Vite + Tailwind + shadcn/ui (PWA)
└── shared/     @bolao/shared — enums, DTOs, contratos de API
```

O frontend é um **single-page application** mobile-first (PWA) que conversa com o backend via HTTP/JSON. O backend expõe uma API REST, persiste em MongoDB e integra-se com a Football Data API para importar times, partidas e resultados.

## Diagrama lógico

```
                          ┌────────────────────────┐
                          │  Football Data API     │
                          │  (api.football-data.org)│
                          └───────────┬────────────┘
                                      │  HTTP/JSON
                                      │  X-Auth-Token
                                      ▼
┌──────────────┐  HTTPS    ┌────────────────────────┐  Mongoose   ┌──────────────┐
│   Frontend   │◀────────▶│        Backend         │◀──────────▶│   MongoDB    │
│  React 19    │   /api   │      NestJS 10         │             │              │
│  Vite + PWA  │   /auth  │  JWT (Google OAuth)    │             │              │
│  TanStack Q. │          │  Crons + Workers       │             │              │
└──────────────┘          └────────────────────────┘             └──────────────┘
        │                              │
        │ Google ID token              │
        ▼                              │
┌──────────────────┐                   │
│ Google Identity  │                   │
│   Services       │───────────────────┘
└──────────────────┘   (verifyIdToken)
```

## Backend (`backend/`)

### Stack

- **NestJS 10** + **TypeScript 5.7**
- **Mongoose 8** via `@nestjs/mongoose`
- **JWT** (`@nestjs/jwt` + `passport-jwt`) com `JwtAuthGuard` registrado como `APP_GUARD` global
- **Google OAuth** via `google-auth-library` (verificação de ID token)
- **`class-validator` + `class-transformer`** via `ValidationPipe` global
- **`@nestjs/schedule`** para tarefas cron
- **`@nestjs/swagger`** expondo OpenAPI em `/api/docs` (apenas fora de produção)
- **`helmet`** + CORS configurável

### Módulos

| Módulo          | Responsabilidade                                                                                  |
|-----------------|---------------------------------------------------------------------------------------------------|
| `auth`          | Login com Google (extrai `name`, `givenName`, `email`, `picture`), emissão de JWT, `JwtStrategy`, decorator `@Public()` |
| `user`          | CRUD de usuários, perfil, ativação/desativação, sincronização de avatar local                     |
| `team`          | Importação e armazenamento dos times (escudos baixados localmente)                                |
| `stage`         | Estado derivado (`LOCKED`/`OPEN`/`CLOSED`) via `getStageState`, seed inicial via enum (`StageService.onModuleInit`) |
| `match`         | CRUD de partidas + importação Football Data (TBD são skipadas, transições não-canônicas geram warning) |
| `bet`           | Palpites esparsos do usuário, atualização em lote (tudo-ou-nada), agregação para visualização do grupo |
| `leaderboard`   | Singleton recomputado por `LeaderboardService.rebuild()` + stats derivadas (substitui v1 `ranking/` e `stats/`) |
| `system-state`  | Singleton com timestamps de sync (`scoreSyncStartedAt`, `leaderboardRebuildAt`, etc) — substitui v1 `config/` |
| `schedule`      | Cron unificada `MatchSyncTask` (`*/5 * * * *` + `OnApplicationBootstrap`)                         |
| `media`         | Download de avatares e escudos para `/static/`                                                    |
| `health`        | Healthcheck público                                                                               |
| `common`        | Decorators (`@Public`, `@CurrentUser`), `AdminGuard`, `ActiveParticipantGuard`, exception filter, validação de env |

### Camadas dentro de cada módulo

```
src/<modulo>/
├── <modulo>.controller.ts   HTTP / OpenAPI / guards
├── <modulo>.service.ts      regras de negócio + acesso ao Mongoose
├── <modulo>.module.ts       declaração de schemas, providers, exports
├── schemas/<entidade>.schema.ts   classe + decorators Mongoose
└── dto/<acao>.dto.ts        contrato de entrada validado por class-validator
```

### Bootstrap (`src/main.ts`)

- `helmet` com `crossOriginResourcePolicy: cross-origin` (necessário para servir imagens estáticas via `<img>` do frontend)
- Serve estáticos em `/static/` a partir de `STATIC_DIR` (default `./static`)
- `enableCors({ origin: CORS_ORIGINS, credentials: true })`
- `ValidationPipe` global com `whitelist`, `transform`, `enableImplicitConversion`
- `AllExceptionsFilter` global
- Swagger em `/api/docs` quando `NODE_ENV !== 'production'`

### Autorização global

`JwtAuthGuard` é registrado como `APP_GUARD` em `app.module.ts`. Por padrão **toda rota exige JWT**. Rotas públicas precisam do decorator `@Public()`. Operações administrativas usam adicionalmente o `AdminGuard` (`common/admin.guard.ts`) sobre handlers individuais — checagem do flag `isAdmin` do JWT.

### Persistência

MongoDB acessado via Mongoose. Cada entidade tem schema com índices explícitos onde aplicável:

- `User.googleSub` único
- `Team.footballDataId` único
- `Match.footballDataId` único; índices em `utcDate`, `stage`, `homeTeam`, `awayTeam`, `status` e composto `{ stage, utcDate }`
- `Bet` indexado por `user`, `match` e composto único `{ user, match }`
- `Stage.code` e `Stage.order` ambos únicos
- `Leaderboard` singleton por `key: 'singleton'`; `SystemState` idem

### Crons

Uma única task em `src/schedule/match-sync.task.ts`:

| Task             | Trigger                                       | Função                                                                                  |
|------------------|-----------------------------------------------|-----------------------------------------------------------------------------------------|
| `MatchSyncTask`  | `OnApplicationBootstrap` + `*/5 * * * *`      | Importa times+matches da Football Data, atualiza placares, rebuilda leaderboard se mudou |

Não há mais `BlockStagesTask`/`ImportMatchesTask`/`UpdateScoresTask` da v1 — estado de fase é derivado do `deadline` a cada request e o sync unifica calendário, placares e pontuação. Detalhes em [features/sincronizacao-externa.md](./features/sincronizacao-externa.md).

## Frontend (`frontend/`)

### Stack

- **React 19** + **TypeScript 5.7** + **Vite 7**
- **React Router v7** (`react-router-dom`) — `createBrowserRouter`
- **TanStack Query v5** para estado servidor e cache
- **Tailwind** com tokens via CSS vars (`rgb(var(--token) / <alpha-value>)`) + `tailwindcss-animate`
- **shadcn/ui** sobre **Radix primitives**
- **`@react-oauth/google`** + **`jwt-decode`** para login
- **`react-hook-form`** + **zod** via `@hookform/resolvers`
- **Recharts**, **lucide-react**, **sonner**, **date-fns**
- **PWA** via `vite-plugin-pwa` + `workbox-window`

### Camadas

```
src/
├── App.tsx, main.tsx, router.tsx, index.css
├── components/
│   ├── ui/         primitives shadcn (button, card, tabs, accordion, …)
│   ├── layout/     AppShell, Header, BottomNav, AuthenticatedLayout
│   ├── shared/     TeamCrest, EmptyState, LiveDot, StageBadge
│   └── guards/     ProtectedRoute, PublicOnlyRoute, AdminRoute, ActiveRoute (todos em ProtectedRoute.tsx)
├── features/       uma pasta por tela (auth, home, bets, bolao, ranking, stats, admin)
├── hooks/          wrappers de React Query (useMe, useStages, useMatches, useBets, useWatchResults, usePwaInstall, …)
├── lib/            api (fetch + JWT), cn, format, scoring, stage, ranking, assets
└── providers/      ThemeProvider, AuthProvider, QueryProvider
```

### Roteamento

Definido em `frontend/src/router.tsx`:

| Path        | Guarda           | Tela                |
|-------------|------------------|---------------------|
| `/login`    | `PublicOnlyRoute`| `LoginScreen`       |
| `/`         | `ProtectedRoute` | `HomeScreen`        |
| `/apostas`  | `ActiveRoute`    | `BetsScreen`        |
| `/bolao`    | `ProtectedRoute` | `BolaoScreen`       |
| `/ranking`  | `ProtectedRoute` | `RankingScreen`     |
| `/stats`    | `ProtectedRoute` | `StatsScreen`       |
| `/admin`    | `AdminRoute`     | `AdminScreen`       |
| `*`         | —                | redirect → `/`      |

As rotas autenticadas ficam aninhadas sob `/` via `AuthenticatedLayout`. `ProtectedRoute` exige sessão; `ActiveRoute` exige sessão **e** `isActive: true` (espectador é redirecionado); `AdminRoute` exige sessão **e** `isAdmin: true` no JWT decodificado; `PublicOnlyRoute` redireciona usuários já logados para `/`.

### Estado servidor

Toda chamada à API é encapsulada em hooks em `src/hooks/`. Cada hook usa `useQuery` ou `useMutation` do TanStack Query, com `queryKey` estável e invalidação seletiva após mutações.

### Comunicação com o backend

`src/lib/api.ts` centraliza `fetch` com:
- Anexação automática do header `Authorization: Bearer <token>` quando há sessão
- Tratamento de respostas no formato `{ data, error }` definido por `ApiResponse<T>` em `@bolao/shared`
- Erros tipados via `isApiError`

O dev server faz **proxy** de `/api`, `/auth` e `/healthcheck` para `http://localhost:3000` (configurado em `vite.config.ts`).

## Pacote compartilhado (`shared/`)

`@bolao/shared` é o ponto único de verdade para tipos cruzando frontend↔backend. Cada arquivo em `shared/src/` é reexportado por `index.ts`. Exporta:

- **Enums** (`enums.ts`): `MatchStage`, `StageState`, `MatchStatus`
- **Constantes** (`enums.ts`): `STAGE_ORDER`, `STAGE_DEADLINES`, `STAGE_EXPECTED_MATCHES`, `STAGE_PREDECESSOR`, `VALID_POINTS` (+ tipo `PointsEarned`), `MAX_GOALS`
- **Envelope de API** (`api.ts`): `ApiSuccess<T>`, `ApiErrorBody`, `ApiResponse<T>` + guard `isApiError`
- **Pontuação** (`scoring.ts`): `SCORING_RULES`, `calculateBetScore`, `compareLeaderboardRows`, tipos `Score`, `BetScoreResult`, `LeaderboardRow`, `LeaderboardBreakdown`
- **Estado de fase** (`stage-state.ts`): `getStageState`, `findPredecessor`, tipo `StageInput`
- **De-para de status** (`match-status.ts`): `mapExternalStatus`, `isCanonicalTransition`, `CANONICAL_TRANSITIONS`, `EXTERNAL_STATUSES`
- **Bandeiras** (`flag-emoji.ts`): `tlaToFlagEmoji`
- **Datas** (`date.ts`): `nowtoLocalISOString`, `toLocalISOString`
- **DTOs** (`dto.ts`): `AuthenticatedUser`, `UserPayload`, `TeamPayload`, `StagePayload`, `StageReadinessItem`, `MatchPayload`, `BetResult`, `MyBetItem`, `BetSubmitItem`, `BetSubmitPayload`, `GroupedBetParticipant`, `GroupedBetMatch`, `LeaderboardItem`, `LeaderboardPayload`, `StatsOverview`, `UserAccuracy`, `Distribution`, `SystemStatePayload`

Build via `tsc`; consumido como `workspace:*`. Após qualquer alteração de contrato, rodar `pnpm build:shared` para que backend e frontend leiam o `dist/` atualizado.

## Diretório estático

O backend serve imagens (escudos de seleções, fotos de perfil de usuários) em `/static/`. Arquivos ficam em `STATIC_DIR` (default `backend/static/`) organizados em:

```
static/
├── teams/<TLA>.png          escudos das seleções
└── users/<userId>.<ext>     fotos de perfil
```

O processo de download está implementado em `backend/src/common/download.ts` e é chamado:
- Em `TeamService.importTeams` quando um time é criado/atualizado
- Em `UserService.upsert` no login, quando a URL externa muda

Há autocorreção: no boot, `TeamService.onModuleInit` chama `syncMissingCrests` que re-baixa escudos faltando no disco; `UserService.upsert` re-baixa avatares quando o arquivo local sumiu mas o registro ainda aponta para `/static/`.

## Build e deploy

- `pnpm build` na raiz roda `tsc + vite build` no frontend, `nest build` no backend e `tsc` no shared, em série (`workspace-concurrency=1`)
- O Mongo em desenvolvimento é provido por `docker-compose.yml` (`docker compose up -d mongo`)
- Backend e frontend ainda não estão no compose — em transição de UI/toolchain (ver [refactor-decisions](../README.md))
