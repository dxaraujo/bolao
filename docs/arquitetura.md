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

| Módulo        | Responsabilidade                                                                                  |
|---------------|---------------------------------------------------------------------------------------------------|
| `auth`        | Login com Google, emissão de JWT, `JwtStrategy`, decorator `@Public()`                            |
| `user`        | CRUD de usuários, perfil, ativação/desativação, sincronização de avatar local                     |
| `team`        | Importação e armazenamento dos times (escudos baixados localmente)                                |
| `stage`       | Ciclo de vida das fases (DISABLED → OPEN → BLOCKED), seed inicial e bloqueio automático            |
| `match`       | CRUD de partidas + importação a partir da Football Data API                                       |
| `bet`         | Palpites do usuário, atualização em lote, agregação para visualização do grupo                    |
| `ranking`     | Leitura agregada do ranking (já materializado em `User`)                                          |
| `stats`       | Estatísticas: KPIs, acerto por usuário, distribuição de resultados                                |
| `config`      | Flag global e configuração de pontuação                                                           |
| `schedule`    | Crons (`UpdateScoresTask`, `ImportMatchesTask`, `BlockStagesTask`)                                |
| `health`      | Healthcheck público                                                                               |
| `common`      | Decorators (`@Public`, `@CurrentUser`), `AdminGuard`, exception filter, validação de env, utilidades de download e diretório estático |

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
- `Match.footballDataId` único; índices em `utcDate`, `stage`, `homeTeam`, `awayTeam`, `valid`
- `Bet` indexado por `user`, `match` e composto `{ user, match }`
- `Stage.matchStage` e `Stage.order` ambos únicos

### Crons

Três tarefas em `src/schedule/`:

| Task                  | Cron               | Função                                                                |
|-----------------------|--------------------|-----------------------------------------------------------------------|
| `UpdateScoresTask`    | `*/5 7-20 * * *`   | Busca placares e dispara recálculo de pontuação para partidas alteradas |
| `ImportMatchesTask`   | `0 0 * * *`        | Reimporta o calendário de partidas                                    |
| `BlockStagesTask`     | `* * * * *`        | Bloqueia fases cujo `deadline` foi ultrapassado                       |

Detalhes em [features/sincronizacao-externa.md](./features/sincronizacao-externa.md) e [features/gestao-fases.md](./features/gestao-fases.md).

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
│   └── guards/     ProtectedRoute, PublicOnlyRoute, AdminRoute
├── features/       uma pasta por tela (auth, home, bets, bolao, ranking, stats, admin)
├── hooks/          wrappers de React Query (useMe, useStages, useMatches, useBets, …)
├── lib/            api (fetch + JWT), cn, format, scoring, stage, ranking, assets
└── providers/      ThemeProvider, AuthProvider, QueryProvider
```

### Roteamento

Definido em `frontend/src/router.tsx`:

| Path        | Guarda           | Tela                |
|-------------|------------------|---------------------|
| `/login`    | `PublicOnlyRoute`| `LoginScreen`       |
| `/`         | `ProtectedRoute` | `HomeScreen`        |
| `/apostas`  | `ProtectedRoute` | `BetsScreen`        |
| `/bolao`    | `ProtectedRoute` | `BolaoScreen`       |
| `/ranking`  | `ProtectedRoute` | `RankingScreen`     |
| `/stats`    | `ProtectedRoute` | `StatsScreen`       |
| `/admin`    | `AdminRoute`     | `AdminScreen`       |
| `*`         | —                | redirect → `/`      |

`ProtectedRoute` exige sessão; `AdminRoute` exige sessão **e** `isAdmin: true` no JWT decodificado; `PublicOnlyRoute` redireciona usuários já logados para `/`.

### Estado servidor

Toda chamada à API é encapsulada em hooks em `src/hooks/`. Cada hook usa `useQuery` ou `useMutation` do TanStack Query, com `queryKey` estável e invalidação seletiva após mutações.

### Comunicação com o backend

`src/lib/api.ts` centraliza `fetch` com:
- Anexação automática do header `Authorization: Bearer <token>` quando há sessão
- Tratamento de respostas no formato `{ data, error }` definido por `ApiResponse<T>` em `@bolao/shared`
- Erros tipados via `isApiError`

O dev server faz **proxy** de `/api`, `/auth` e `/healthcheck` para `http://localhost:3000` (configurado em `vite.config.ts`).

## Pacote compartilhado (`shared/`)

`@bolao/shared` é o ponto único de verdade para tipos cruzando frontend↔backend. Exporta:

- **Enums:** `StageStatus`, `MatchStage`, `MatchStatus`
- **Constantes:** `STAGE_ORDER`, `STAGE_DEADLINES`, `VALID_POINTS`
- **Tipos:** `PointsEarned`, `ApiSuccess<T>`, `ApiErrorBody`, `ApiResponse<T>` + guard `isApiError`
- **DTOs:** `AuthenticatedUser`, `ConfigPayload`, `StageVisibleItem`, `MatchListItem`, `BetListItem`, `BetUpdateItem`, `GroupedBet`, `GroupedBetItem`, `RankingItem`, `StatsOverview`, `UserAccuracy`, `Distribution`, `TeamPayload`
- **Helpers de data:** `nowtoLocalISOString`

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
