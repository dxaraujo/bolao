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

> Backend e frontend ainda não estão no compose — em transição de UI/toolchain. Serão adicionados quando a reescrita estabilizar.

## Documentação por pacote

- [frontend/README.md](frontend/README.md) — stack do app, variáveis `VITE_*`, estrutura de pastas
- [backend/README.md](backend/README.md) — endpoints da API, variáveis de ambiente, crons, OpenAPI em `/api/docs`

## shared/ — código compartilhado

Pacote `@bolao/shared` registrado como workspace pnpm. Expõe:

- **Enums:** `StageStatus` (DISABLED, OPEN, BLOCKED), `MatchStage` (GROUP_STAGE…FINAL), `MatchStatus`
- **Domínio:** `VALID_POINTS` + tipo `PointsEarned`, `STAGE_ORDER`, `STAGE_DEADLINES`
- **API:** `ApiSuccess<T>`, `ApiErrorBody`, `ApiResponse<T>` + type guard `isApiError`
- **DTOs:** contratos de request/response usados por backend e frontend
- **Datas:** helpers de formatação compartilhada (`date-fns`)

Para consumir em outro workspace, declare como dependência:

```json
"dependencies": {
  "@bolao/shared": "workspace:*"
}
```

Depois `import { StageStatus } from '@bolao/shared'`.

## Convenções gerais

- Tipos cruzando frontend↔backend vêm de `@bolao/shared`. Não duplicar; não usar `any` na fronteira.
- Terminologia do domínio na UI segue PT-BR (palpites, partidas, fases, grupos, pontuação). Módulos e rotas do backend foram padronizados em inglês (`match`, `stage`, `team`, `bet`).
- PRs pequenos por fase do refactor — app sempre funcionando entre fases.
