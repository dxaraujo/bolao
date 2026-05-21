# Bolão Backend

API NestJS + TypeScript + MongoDB para o bolão.

## Stack

- **NestJS 10** + **TypeScript 5.7**
- **Mongoose 8** via `@nestjs/mongoose`
- **Auth:** Google OAuth + JWT (`@nestjs/jwt` + `passport-jwt`)
- **Validação:** `class-validator` + `class-transformer` via `ValidationPipe` global
- **Cron:** `@nestjs/schedule` para sincronização de resultados

## Pré-requisitos

- Node.js >= 20.11
- MongoDB rodando localmente ou via URI remota

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

A API sobe na porta definida em `PORT` (default 3001).

## Scripts

| Script             | O que faz                                      |
|--------------------|------------------------------------------------|
| `pnpm start`       | Roda em produção (após `build`)                |
| `pnpm start:dev`   | Dev com watch + hot reload via `nest start`    |
| `pnpm start:debug` | Dev com `--debug` para anexar debugger         |
| `pnpm build`       | Compila TS para `dist/`                        |
| `pnpm start:prod`  | Roda `node dist/main` (após `build`)           |

## Variáveis de ambiente

| Variável             | Obrigatória | Default                          |
|----------------------|-------------|----------------------------------|
| `NODE_ENV`           | não         | `development`                    |
| `PORT`               | não         | `3001`                           |
| `MONGODB_URI`        | não         | `mongodb://localhost/bolao`      |
| `AUTH_SECRET`        | **sim**     | —                                |
| `GOOGLE_CLIENT_ID`   | **sim**     | —                                |
| `JWT_EXPIRES_IN`     | não         | `30d`                            |
| `FOOTBALL_DATA_API_URL` | **sim**     | —                                |

## Endpoints

| Método | Path                                          | Auth     |
|--------|-----------------------------------------------|----------|
| GET    | `/healthcheck`                                | público  |
| POST   | `/auth/google` `{ "credential": "…" }`        | público  |
| GET    | `/api/user`, `/api/user/:id`, `/api/user/authenticated` | JWT |
| PUT    | `/api/user/:id`                               | JWT      |
| DELETE | `/api/user/:id`                               | JWT      |
| GET    | `/api/time`, `/api/time/:id`                  | JWT      |
| POST/PUT/DELETE | `/api/time[/:id]`                    | JWT      |
| GET    | `/api/fase`, `/api/fase/:id`                  | JWT      |
| POST/PUT/DELETE | `/api/fase[/:id]`                    | JWT      |
| GET    | `/api/config`                                 | JWT      |
| GET    | `/api/partida`, `/api/partida/resultado`, `/api/partida/:id` | JWT |
| POST/PUT/DELETE | `/api/partida[/:id]`                 | JWT      |
| PUT    | `/api/partida/:id/updateResultado`            | JWT      |
| GET    | `/api/bet`, `/api/bet/:id`            | JWT      |
| POST/PUT/DELETE | `/api/bet[/:id]`                 | JWT      |
| PUT    | `/api/bet/:user/updateBets`           | JWT      |
| GET    | `/api/bet/:user/:fase/montarbets`     | JWT      |

JWT é exigido no header `Authorization: Bearer <token>`. O token é emitido por `POST /auth/google` após verificação do ID token do Google (`credential` no body).

## Estrutura

```
src/
├── main.ts              Bootstrap + ValidationPipe + ExceptionFilter + CORS
├── app.module.ts        Composição raiz de módulos + APP_GUARD
├── auth/                Google OAuth + JWT + JwtStrategy + JwtAuthGuard
├── user/                CRUD de usuários
├── time/                CRUD de seleções
├── fase/                CRUD de fases
├── config/              Config global (flag atualizandoPontuacoes)
├── partida/             CRUD de partidas + ResultadoService (pontuação)
├── bet/             CRUD de bets + montagem por fase
├── schedule/            Cron job que sincroniza resultados externos
├── health/              Healthcheck público
└── common/              env validation, exception filter, decorators
```

## Cron de resultados

A task em [`src/schedule/resultados.task.ts`](src/schedule/resultados.task.ts) roda **a cada 5 min entre 7h e 20h**, consulta `FOOTBALL_DATA_API_URL`, identifica jogos com placar definido e dispara `ResultadoService.atualizarResultados()` apenas para partidas cujo placar mudou.
