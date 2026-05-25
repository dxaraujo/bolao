# Bolão Backend

API NestJS 10 + TypeScript + MongoDB para o bolão da Copa.

## Stack

- **NestJS 10** + **TypeScript 5.7**
- **Mongoose 8** via `@nestjs/mongoose`
- **Auth:** Google OAuth + JWT (`@nestjs/jwt` + `passport-jwt`); `JwtAuthGuard` global como `APP_GUARD`, com decorator `@Public()` para rotas abertas
- **Validação:** `class-validator` + `class-transformer` via `ValidationPipe` global
- **Cron:** `@nestjs/schedule` para sincronização de resultados e bloqueio de fases
- **Docs:** OpenAPI via `@nestjs/swagger` em `/api/docs`
- **Segurança:** `helmet`, CORS configurável

## Pré-requisitos

- Node.js >= 20.11
- MongoDB local ou via URI remota

Na raiz do monorepo, suba o Mongo com Docker:

```bash
docker compose up -d mongo
```

## Setup

```bash
cp .env.example .env
# editar .env com seus valores

pnpm install
pnpm start:dev
```

A API sobe na porta definida em `PORT` (default `3000`).

## Scripts

| Script             | O que faz                              |
| ------------------ | -------------------------------------- |
| `pnpm start:dev`   | Dev com hot reload via nodemon         |
| `pnpm start:debug` | Dev com `--debug` (debugger anexável)  |
| `pnpm start`       | Roda Nest (sem watch)                  |
| `pnpm start:prod`  | `node dist/main` (após `build`)        |
| `pnpm build`       | Compila TS para `dist/`                |
| `pnpm typecheck`   | `tsc --noEmit`                         |
| `pnpm lint`        | ESLint flat config, `--max-warnings=0` |
| `pnpm lint:fix`    | ESLint com `--fix`                     |
| `pnpm format`      | Prettier nos arquivos `src/**/*.ts`    |

## Variáveis de ambiente

| Variável                | Obrigatória | Default                     |
| ----------------------- | ----------- | --------------------------- |
| `NODE_ENV`              | não         | `development`               |
| `PORT`                  | não         | `3000`                      |
| `MONGODB_URI`           | não         | `mongodb://localhost/bolao` |
| `AUTH_SECRET`           | **sim**     | —                           |
| `JWT_EXPIRES_IN`        | não         | `30d`                       |
| `GOOGLE_CLIENT_ID`      | **sim**     | —                           |
| `FOOTBALL_DATA_API_URL` | **sim**     | —                           |
| `FOOTBALL_DATA_API_KEY` | **sim**     | —                           |
| `CORS_ORIGINS`          | não         | `http://localhost:5173`     |
| `STATIC_DIR`            | não         | `./static`                  |

Validação acontece em `src/common/env.validation.ts` no bootstrap — a app falha em start se algo obrigatório faltar.

## Endpoints

Todas as rotas exigem `Authorization: Bearer <token>` (JWT) exceto as marcadas como públicas. O token é emitido por `POST /auth/google` após verificação do ID token do Google.

| Método | Path                          | Auth    | Descrição                                         |
| ------ | ----------------------------- | ------- | ------------------------------------------------- |
| GET    | `/healthcheck`                | público | Liveness                                          |
| POST   | `/auth/google`                | público | Body `{ credential }` → `{ token, user }`         |
| GET    | `/api/user/me`                | JWT     | Usuário autenticado                               |
| GET    | `/api/user/active`            | JWT     | Usuários ativos                                   |
| GET    | `/api/user`                   | JWT     | Lista usuários                                    |
| PUT    | `/api/user/:id`               | JWT     | Atualiza usuário                                  |
| POST   | `/api/team/import`            | JWT     | Importa seleções                                  |
| GET    | `/api/stage`                  | JWT     | Lista fases                                       |
| GET    | `/api/stage/visible`          | JWT     | Fases visíveis para o usuário                     |
| PUT    | `/api/stage/:matchStage`      | JWT     | Atualiza status/deadline da fase                  |
| GET    | `/api/match`                  | JWT     | Lista partidas                                    |
| POST   | `/api/match/import`           | JWT     | Importa partidas da Football Data API             |
| POST   | `/api/match/update-scores`    | JWT     | Atualiza resultados manualmente                   |
| GET    | `/api/bet`                    | JWT     | Palpites do usuário autenticado                   |
| GET    | `/api/bet/all`                | JWT     | Todos os palpites (para ranking/stats)            |
| PUT    | `/api/bet/updateBets`         | JWT     | Salva palpites em batch                           |
| GET    | `/api/config`                 | JWT     | Config global (flag `atualizandoPontuacoes` etc.) |
| GET    | `/api/ranking`                | JWT     | Ranking agregado                                  |
| GET    | `/api/stats/overview`         | JWT     | KPIs gerais                                       |
| GET    | `/api/stats/accuracy-by-user` | JWT     | Acerto por usuário                                |
| GET    | `/api/stats/distribution`     | JWT     | Distribuição de pontos                            |

Schema OpenAPI completo: `http://localhost:3000/api/docs`.

## Estrutura

```
src/
├── main.ts              Bootstrap (Helmet, CORS, ValidationPipe, ExceptionFilter, Swagger)
├── app.module.ts        Composição raiz + APP_GUARD (JwtAuthGuard global)
├── auth/                Google OAuth + JWT + JwtStrategy + JwtAuthGuard + @Public()
├── user/                Usuários
├── team/                Seleções
├── stage/               Fases (status/deadlines)
├── match/               Partidas + ScoreService (importação + pontuação)
├── bet/                 Palpites e montagem em batch
├── ranking/             Ranking agregado
├── stats/               Estatísticas (overview, accuracy, distribution)
├── config/              Config global (flags)
├── schedule/            Crons (update-scores, import-matches, block-stages)
├── health/              Healthcheck público
└── common/              env validation, exception filter, decorators (@Public, @CurrentUser)
```

## Crons

Definidas em `src/schedule/`:

| Task                | Cron             | O que faz                                                                             |
| ------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `UpdateScoresTask`  | `*/5 7-20 * * *` | A cada 5 min, das 7h às 20h: consulta Football Data API e atualiza placares alterados |
| `ImportMatchesTask` | `0 0 * * *`      | Diariamente à 0h: importa o calendário de partidas                                    |
| `BlockStagesTask`   | `* * * * *`      | A cada minuto: bloqueia fases cujo deadline passou                                    |

A integração externa usa `FOOTBALL_DATA_API_URL` + `FOOTBALL_DATA_API_KEY`.
