# Bolão Copa do Mundo

Monorepo da aplicação de bolão para amigos e família apostarem nos jogos da Copa.

```
.
├── backend/    NestJS + TypeScript + Mongoose 8 + MongoDB
├── frontend/   React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui
└── shared/     (futuramente) tipos e contratos compartilhados
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

## Documentação por pacote

- [frontend/README.md](frontend/README.md) — stack do app, variáveis `VITE_*`, estrutura de pastas
- [backend/README.md](backend/README.md) — endpoints da API, variáveis de ambiente, cron de resultados

## shared/ (opcional, ainda não usado)

Quando começarmos a precisar de tipos compartilhados entre frontend e backend (ex.: DTOs, contratos de API), criar `shared/` como um terceiro workspace e referenciar via `import` em ambos os lados.
