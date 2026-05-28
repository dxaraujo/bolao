# Bolão Copa do Mundo 2026

Monorepo da aplicação de bolão para amigos e família apostarem nos jogos da Copa.

```
.
├── backend/    NestJS 10 + TypeScript + Mongoose 8 + MongoDB
├── frontend/   React 19 + Vite 7 + TypeScript + Tailwind + shadcn/ui (PWA)
└── shared/     @bolao/shared — enums, DTOs e contratos de API
```

## Pré-requisitos

- Node.js >= 20.11
- pnpm >= 11 (`corepack enable` resolve via campo `packageManager`)
- MongoDB rodando localmente (ou URI remota)

## Setup

```bash
# instala dependências de todos os workspaces
pnpm install

# copiar e ajustar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Obrigatória | Default (`.env.example`) | Descrição |
|---|---|---|---|
| `NODE_ENV` | não | `development` | `development` ou `production`. Em produção, Swagger é desligado. |
| `PORT` | não | `3000` | Porta HTTP do Nest |
| `MONGODB_URI` | **sim** | `mongodb://localhost/bolao_v2` | URI do MongoDB (lida via `getOrThrow`) |
| `AUTH_SECRET` | **sim** | — | Segredo HMAC para assinar JWTs |
| `JWT_EXPIRES_IN` | não | `30d` | Validade do JWT |
| `GOOGLE_CLIENT_ID` | **sim** | — | Client ID do Google OAuth (`audience` do `verifyIdToken`) |
| `FOOTBALL_DATA_API_URL` | **sim** | — | Ex.: `https://api.football-data.org/v4` |
| `FOOTBALL_DATA_API_KEY` | **sim** | — | Header `X-Auth-Token` |
| `CORS_ORIGINS` | não | `http://localhost:5173` | Origens permitidas (CSV) |
| `STATIC_DIR` | não | `./static` | Diretório onde escudos e avatares são gravados |

Validação no boot via `backend/src/common/env.validation.ts` — a app **falha no start** se faltar obrigatória.

### Frontend (`frontend/.env`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_GOOGLE_CLIENT_ID` | **sim** | Client ID do Google OAuth (só vars `VITE_*` entram no bundle) |

## Rodar em desenvolvimento

```bash
pnpm dev              # backend + frontend em paralelo (output agregado)
pnpm dev:frontend     # só o frontend (Vite, http://localhost:5173)
pnpm dev:backend      # só o backend (Nest watch, http://localhost:3000)
pnpm dev:shared       # rebuild incremental do @bolao/shared
```

O dev server do frontend faz proxy de `/api`, `/auth` e `/healthcheck` para o backend em `:3000`.

## Build de produção

```bash
pnpm build            # build de todos os workspaces (concorrência 1, streaming)
pnpm build:shared     # gera shared/dist/
pnpm build:frontend   # gera frontend/dist/
pnpm build:backend    # gera backend/dist/
```

Mudou contrato em `shared/`? Rode `pnpm build:shared` antes de subir frontend/backend para garantir que ambos leiam o `dist/` atualizado.

## Scripts disponíveis

| Script                | Onde     | O que faz                                       |
|-----------------------|----------|-------------------------------------------------|
| `pnpm dev`            | root     | Sobe frontend + backend em paralelo             |
| `pnpm dev:frontend`   | root     | Só o frontend (Vite)                            |
| `pnpm dev:backend`    | root     | Só o backend (Nest watch via nodemon)           |
| `pnpm dev:shared`     | root     | tsc watch do @bolao/shared                      |
| `pnpm build`          | root     | Build de todos os pacotes                       |
| `pnpm install`        | root     | Instala deps de todos os workspaces             |

Cada pacote também aceita `pnpm --filter ./frontend <script>` ou `cd <pkg> && pnpm <script>`.

## Docker

Subir Mongo isoladamente (recomendado para dev local):

```bash
docker compose up -d mongo
```

A API conecta em `mongodb://localhost:27017` e os dados persistem no volume nomeado `mongo-data` entre restarts.

```bash
docker compose down              # mantém os dados
docker compose down -v           # apaga o volume do Mongo também
```

> Apenas o Mongo está no compose; backend e frontend rodam via `pnpm dev`.

## Do zero ao primeiro palpite

1. `docker compose up -d mongo && pnpm dev`
2. No boot, o `MatchSyncTask` (`OnApplicationBootstrap`) já:
   - cria as 7 fases a partir de `STAGE_ORDER`/`STAGE_DEADLINES`/`STAGE_EXPECTED_MATCHES` (`StageService.onModuleInit`);
   - importa times e partidas da Football Data.
3. Logar com sua conta Google → cria seu `User` (`isActive: false`, sem `isAdmin`).
4. Virar admin/participante manualmente no Mongo:
   ```js
   db.users.updateOne({ email: 'seu@email' }, { $set: { isAdmin: true, isActive: true } })
   ```
5. Palpites são **esparsos** — vá em `/apostas` para criar.

> Para exercitar placares/ranking sem esperar a Copa, ajuste o `deadline` das fases (`PATCH /api/stage/:code`) e os documentos de `Match` (status/score) direto no Mongo — o ranking recomputa no próximo sync ou via `POST /api/leaderboard/rebuild`.

## Documentação

- **[`.spec/`](.spec/README.md)** — especificação formal por módulo (visão geral do sistema, requisitos, contratos, casos de borda)
- [frontend/README.md](frontend/README.md) — stack do app, variáveis `VITE_*`, estrutura de pastas
- [backend/README.md](backend/README.md) — endpoints da API, variáveis de ambiente, crons, OpenAPI em `/api/docs`

## shared/ — código compartilhado

Pacote `@bolao/shared` registrado como workspace pnpm. Expõe:

- **Enums:** `MatchStage` (GROUP_STAGE…FINAL), `StageState` (LOCKED, OPEN, CLOSED — derivado), `MatchStatus` (SCHEDULED, LIVE, FINISHED, CANCELLED)
- **Domínio:** `STAGE_ORDER`, `STAGE_DEADLINES`, `STAGE_EXPECTED_MATCHES`, `STAGE_PREDECESSOR`, `VALID_POINTS` (+ `PointsEarned`), `MAX_GOALS`
- **Funções puras:** `calculateBetScore`, `compareLeaderboardRows` (`scoring.ts`), `getStageState` (`stage-state.ts`), `mapExternalStatus`/`isCanonicalTransition` (`match-status.ts`), `tlaToFlagEmoji` (`flag-emoji.ts`)
- **API:** `ApiSuccess<T>`, `ApiErrorBody`, `ApiResponse<T>` + type guard `isApiError`
- **DTOs:** contratos de request/response usados por backend e frontend (`dto.ts`)

Para consumir em outro workspace, declare como dependência:

```json
"dependencies": {
  "@bolao/shared": "workspace:*"
}
```

Depois `import { MatchStage } from '@bolao/shared'`.

## Convenções gerais

- Tipos cruzando frontend↔backend vêm de `@bolao/shared`. Não duplicar; não usar `any` na fronteira.
- Terminologia técnica em inglês (módulos, classes, rotas: `match`, `stage`, `team`, `bet`); terminologia de domínio na UI em PT-BR (palpite, partida, fase, ranking).
- Indentação com **tabs**.
- Backend: regras de negócio nos services; controllers só mapeiam HTTP ↔ DTO. ESLint + Prettier.
- Frontend: hooks de `src/hooks/` são a única forma de chamar a API a partir de componentes.
