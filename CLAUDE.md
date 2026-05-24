# CLAUDE.md

Guia para agentes (Claude Code) trabalhando neste repositório.

> **Documentação detalhada do projeto em [`docs/`](./docs/README.md).** Antes de mexer numa feature, leia o doc dela em [`docs/features/`](./docs/features/README.md) — este CLAUDE.md cobre só o necessário para se orientar; o resto está lá.

## Visão geral

Monorepo pnpm da aplicação **Bolão da Copa 2026** — app privado para amigos/família apostarem nos jogos. Não é produto público; não há necessidade de fluxos pesados de moderação, anti-fraude ou escala massiva.

```
.
├── backend/    NestJS 10 + TS 5 + Mongoose 8 (MongoDB)
├── frontend/   React 19 + Vite 7 + TS 5 + Tailwind v4 + shadcn/ui (PWA mobile-first)
└── shared/     @bolao/shared — enums, DTOs e contratos de API
```

## Stack

**Backend** — NestJS 10, Mongoose 8, Google OAuth + JWT (`@nestjs/jwt` + `passport-jwt`), `class-validator` via `ValidationPipe` global, `@nestjs/schedule` para cron, Swagger em `/api/docs`, Helmet.

**Frontend** — React 19, React Router v7, TanStack Query v5, Radix UI primitives, Tailwind, `react-hook-form` + zod (`@hookform/resolvers`), Recharts, `date-fns`, `sonner`, `lucide-react`, `vite-plugin-pwa`.

**Shared** — pacote workspace `@bolao/shared` com enums (`FaseStatus`, `PONTOS_VALIDOS`), DTOs e tipos `ApiSuccess<T> | ApiErrorBody` + guard `isApiError`. Build via `tsc`, consumido como `workspace:*`.

## Comandos (rodar da raiz)

```
pnpm install              # instala tudo
pnpm dev                  # backend + frontend em paralelo
pnpm dev:backend          # só backend (Nest watch, :3000)
pnpm dev:frontend         # só frontend (Vite, :5173, com proxy /api /auth /healthcheck)
pnpm build                # build de todos os workspaces (concorrência 1, stream)
pnpm build:shared         # rebuild só do shared (necessário se mudou contrato)
docker compose up -d mongo  # sobe Mongo local; URI default mongodb://localhost/bolao
```

Por pacote: `pnpm --filter ./backend …`, `pnpm --filter ./frontend …`, ou `cd` para o diretório.

Type-check sem build: `pnpm --filter ./backend typecheck` / `pnpm --filter ./frontend typecheck`.
Lint: `pnpm --filter ./backend lint` (eslint flat config, max-warnings=0) / `pnpm --filter ./frontend lint`.

## Estrutura do backend (`backend/src/`)

Módulos (cada um com `*.module.ts`, `*.controller.ts`, `*.service.ts`, schemas Mongoose e DTOs):

- `auth/` — Google ID token → JWT. `JwtAuthGuard` registrado como `APP_GUARD` global; rotas públicas usam `@Public()`.
- `user/`, `team/`, `stage/`, `match/`, `bet/` — CRUD do domínio.
- `ranking/`, `stats/` — leituras agregadas para as telas de ranking e estatísticas.
- `config/` — flags globais (ex.: `atualizandoPontuacoes`).
- `schedule/` — cron de sincronização de resultados externos (`FOOTBALL_DATA_API_URL`), 5 em 5 min entre 7h–20h, dispara `ResultadoService` só p/ partidas com placar alterado.
- `health/` — `/healthcheck` público.
- `common/` — validação de env, exception filter, decorators (`@Public()`, `@CurrentUser()`).

Rotas: `/auth/google`, `/healthcheck`, `/api/{user,team,stage,match,bet,config,ranking,stats}`. JWT em `Authorization: Bearer <token>`.

Variáveis de ambiente obrigatórias: `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `FOOTBALL_DATA_API_URL`. Opcionais: `PORT` (3000), `MONGODB_URI`, `JWT_EXPIRES_IN` (30d), `NODE_ENV`. Ver `backend/.env.example`.

## Estrutura do frontend (`frontend/src/`)

```
App.tsx, main.tsx, router.tsx
components/
  ui/         primitives shadcn (button, card, tabs, accordion, …)
  layout/     AppShell, Header, BottomNav, AuthenticatedLayout
  shared/     TeamCrest, EmptyState, LiveDot, StageBadge
  guards/     ProtectedRoute, PublicOnlyRoute
features/     auth, home, bets, bolao, ranking, stats — cada uma com Screen + componentes locais
hooks/        useMe, useStages, useMatches, useBets, useRanking, useConfig, useStats (wrappers de React Query)
lib/          api (fetch + JWT), cn, format, scoring, stage
providers/    ThemeProvider, AuthProvider, QueryProvider
```

Tema dark/light via CSS vars (`:root` / `.dark`) lidas pelo `tailwind.config.ts` com `rgb(var(--token) / <alpha-value>)`. Tokens em `src/index.css`. Mobile-first; PWA via `vite-plugin-pwa`.

Variável obrigatória: `VITE_GOOGLE_CLIENT_ID`.

## Convenções

- **Tipos cruzando frontend↔backend** vêm de `@bolao/shared`. Não duplicar; não usar `any` na fronteira.
- **Terminologia do domínio (PT-BR):** palpites, partidas, fases, grupos, pontuação. Rotas e nomes de módulos no backend foram migrados para inglês (`match`, `stage`, `team`, `bet`) — UI permanece em PT.
- **Mudou contrato no `shared/`?** Rodar `pnpm build:shared` para que backend e frontend leiam o `dist/` atualizado.
- **PRs pequenos por fase do refactor.** Não misturar troca de toolchain/UI com mudanças de feature. Cada PR auto-contido e revisável; app sempre funcionando entre fases.
- **Não criar arquivos `.md` novos** (planos, notas, resumos) a menos que pedido explicitamente. Usar contexto da conversa.

## Documentação de referência

Tudo abaixo está em PT-BR e reflete o estado atual do código. Consulte antes de modificar a feature correspondente — economiza leitura de código e evita refazer raciocínio.

### Visão geral

- [`docs/README.md`](./docs/README.md) — índice e convenções
- [`docs/arquitetura.md`](./docs/arquitetura.md) — monorepo, módulos backend, camadas frontend, bootstrap, diretório estático
- [`docs/dominio.md`](./docs/dominio.md) — entidades (User/Team/Match/Stage/Bet/Config), regras de pontuação, critério de desempate, fluxos completos
- [`docs/api.md`](./docs/api.md) — referência REST de todos os endpoints, autenticação, envelope `ApiResponse<T>`
- [`docs/desenvolvimento.md`](./docs/desenvolvimento.md) — setup, scripts, env vars, debug, fluxo "do zero ao primeiro palpite"

### Funcionalidades — [`docs/features/`](./docs/features/README.md)

- [`autenticacao.md`](./docs/features/autenticacao.md) — Google OAuth + JWT, `JwtAuthGuard` global, `@Public()`, `AdminGuard`
- [`home.md`](./docs/features/home.md) — `HomeScreen` (`/`): HeroPosition, OpenStageBanner, ao vivo, próximos (janela 2 dias), recentes
- [`apostas.md`](./docs/features/apostas.md) — `BetsScreen` (`/apostas`): tabs por fase, BetCard, progress, salvar em lote
- [`bolao.md`](./docs/features/bolao.md) — `BolaoScreen` (`/bolao`): agregado por partida, só fases `BLOCKED`
- [`ranking.md`](./docs/features/ranking.md) — `RankingScreen` (`/ranking`): pódio, lista completa, gráfico, tabela de regras
- [`estatisticas.md`](./docs/features/estatisticas.md) — `StatsScreen` (`/stats`): KPIs, accuracy por usuário, donut de distribuição
- [`admin.md`](./docs/features/admin.md) — `AdminScreen` (`/admin`): importações, gestão de fases, gestão de usuários
- [`gestao-fases.md`](./docs/features/gestao-fases.md) — lifecycle `DISABLED → OPEN → BLOCKED`, deadlines, `BlockStagesTask`, exceção `THIRD_PLACE`/`FINAL`
- [`pontuacao.md`](./docs/features/pontuacao.md) — `calculateBetScore`, agregação, ranking com desempate, **divergência Config × valores hardcoded**
- [`sincronizacao-externa.md`](./docs/features/sincronizacao-externa.md) — Football Data API, três crons, idempotência

### Quando consultar o quê

| Tarefa                                        | Comece por                              |
|-----------------------------------------------|-----------------------------------------|
| Entender o domínio antes de mexer no schema   | `docs/dominio.md`                       |
| Adicionar/modificar endpoint REST             | `docs/api.md` + doc da feature          |
| Trabalhar numa tela do frontend               | `docs/features/<tela>.md`               |
| Mexer em pontuação ou ranking                 | `docs/features/pontuacao.md`            |
| Mexer em cron, importação ou Football Data    | `docs/features/sincronizacao-externa.md`|
| Mexer no ciclo de vida das fases              | `docs/features/gestao-fases.md`         |
| Setup de ambiente local                       | `docs/desenvolvimento.md`               |

> **Atualize a documentação ao mudar a feature.** Se você adicionou um endpoint, mudou o cálculo de pontos, ou alterou o lifecycle de uma fase, ajuste o doc correspondente no mesmo PR.
