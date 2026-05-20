# Bolão Copa do Mundo

Monorepo da aplicação de bolão para amigos e família apostarem nos jogos da Copa.

```
.
├── backend/    NestJS + TypeScript + Mongoose 8 + MongoDB
├── frontend/   React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui
└── shared/    @bolao/shared — enums e contratos de API consumidos por backend e frontend
```

## Pré-requisitos

- Node.js >= 20.11
- pnpm >= 9 (`corepack enable` cuida disso usando o campo `packageManager`)
- MongoDB rodando localmente (ou URI remota)

## Setup

```bash
# instala dependências de frontend e backend em um único passo
pnpm install

# copiar e ajustar as variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Rodar em desenvolvimento

```bash
# os dois em paralelo (output agregado)
pnpm dev

# individualmente
pnpm dev:frontend     # http://localhost:3000
pnpm dev:backend      # http://localhost:3001
```

## Build de produção

```bash
pnpm build            # build dos dois pacotes
pnpm build:frontend   # gera frontend/build/
pnpm build:backend    # gera backend/dist/
```

## Scripts disponíveis

| Script               | Onde     | O que faz                          |
|----------------------|----------|------------------------------------|
| `pnpm dev`           | root     | Sobe frontend + backend em paralelo |
| `pnpm dev:frontend`  | root     | Só o frontend (Vite)                |
| `pnpm dev:backend`   | root     | Só o backend (Nest watch)           |
| `pnpm build`         | root     | Build de ambos                      |
| `pnpm install`       | root     | Instala deps de todos os workspaces |

Você também pode entrar em cada pacote e rodar os scripts diretamente:
```bash
cd frontend && pnpm dev
cd backend && pnpm start:dev
```

## Docker

Subir backend + MongoDB juntos sem instalar nada local (precisa de Docker e variáveis de ambiente no shell):

```bash
export AUTH_SECRET=algumacoisa-forte
export GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
export FOOTBALL_DATA_API_URL='https://...'

docker compose up -d --build
docker compose logs -f backend
```

A API sobe em `http://localhost:3001` e o Mongo em `mongodb://localhost:27017`. Dados persistem no volume nomeado `mongo-data` entre restarts.

Para derrubar tudo:
```bash
docker compose down              # mantém os dados
docker compose down -v           # apaga o volume do Mongo também
```

> O frontend ainda não está no compose porque está em transição de UI. Será adicionado quando a reescrita Tailwind+shadcn estiver estabilizada.

## Documentação por pacote

- [frontend/README.md](frontend/README.md) — stack do app, variáveis `VITE_*`, estrutura de pastas
- [backend/README.md](backend/README.md) — endpoints da API, variáveis de ambiente, cron de resultados, OpenAPI em `/api/docs`

## shared/ — código compartilhado

Pacote `@bolao/shared` registrado como workspace pnpm. Atualmente expõe:

- `FaseStatus` (enum: DISABLED, OPEN, BLOCKED)
- `PONTOS_VALIDOS` + tipo `PontosObtidos` (regra de pontuação do bolão)
- `ApiSuccess<T>`, `ApiErrorBody`, `ApiResponse<T>` + type guard `isApiError`

Para consumir em outro workspace, basta declarar como dependência:
```json
"dependencies": {
  "@bolao/shared": "workspace:*"
}
```

Depois `import { FaseStatus } from '@bolao/shared'`.
