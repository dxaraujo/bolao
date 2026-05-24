# Desenvolvimento

Guia prático para rodar, depurar e estender a aplicação.

## Pré-requisitos

- **Node.js** >= 20.11
- **pnpm** >= 11 (via `corepack enable`; o repo declara `packageManager: pnpm@11.1.3`)
- **MongoDB** rodando localmente (ou URI remota acessível)
- **Conta Google** para criar credenciais OAuth e (opcionalmente) chave da Football Data API

## Setup inicial

```bash
# instala deps em todos os workspaces (frontend, backend, shared)
pnpm install

# copiar e ajustar variáveis de ambiente
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Sobe um Mongo local via Docker (recomendado):

```bash
docker compose up -d mongo
```

## Rodar em desenvolvimento

```bash
pnpm dev                # backend + frontend em paralelo (output agregado)
pnpm dev:frontend       # só Vite em http://localhost:5173
pnpm dev:backend        # só Nest (watch) em http://localhost:3000
pnpm dev:shared         # tsc --watch do pacote compartilhado
```

O dev server do frontend faz **proxy** de `/api`, `/auth` e `/healthcheck` para `:3000` (config em `frontend/vite.config.ts`), então o cliente sempre chama caminhos relativos.

## Build de produção

```bash
pnpm build              # build de todos os workspaces, em série
pnpm build:shared       # gera shared/dist/
pnpm build:frontend     # gera frontend/dist/ (tsc -b && vite build)
pnpm build:backend      # gera backend/dist/ (nest build)
```

> **Sempre que mudar contrato em `shared/`** (enums, DTOs, helpers), rode `pnpm build:shared` para que backend e frontend leiam o `dist/` atualizado.

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável                  | Obrigatória | Default                       | Descrição                                                        |
|---------------------------|-------------|-------------------------------|------------------------------------------------------------------|
| `NODE_ENV`                | não         | `development`                 | `development` ou `production`. Em produção, Swagger é desligado. |
| `PORT`                    | não         | `3000`                        | Porta HTTP do Nest                                               |
| `MONGODB_URI`             | não         | `mongodb://localhost/bolao`   | URI do MongoDB                                                   |
| `AUTH_SECRET`             | **sim**     | —                             | Segredo HMAC para assinar JWTs                                   |
| `JWT_EXPIRES_IN`          | não         | `30d`                         | Tempo de validade do JWT                                         |
| `GOOGLE_CLIENT_ID`        | **sim**     | —                             | Client ID do Google OAuth (usado como `audience` do verifyIdToken) |
| `FOOTBALL_DATA_API_URL`   | **sim**     | —                             | Ex.: `https://api.football-data.org/v4`                          |
| `FOOTBALL_DATA_API_KEY`   | **sim**     | —                             | Header `X-Auth-Token`                                            |
| `CORS_ORIGINS`            | não         | `http://localhost:5173`       | Lista de origens permitidas (CSV)                                |
| `STATIC_DIR`              | não         | `./static`                    | Diretório onde escudos e avatares são gravados                   |

Validação roda no boot via `backend/src/common/env.validation.ts` — a app **falha em start** se algo obrigatório estiver faltando.

### Frontend (`frontend/.env`)

Todas com prefixo `VITE_*` (Vite expõe apenas variáveis com esse prefixo ao bundle).

| Variável                | Obrigatória | Descrição                       |
|-------------------------|-------------|---------------------------------|
| `VITE_GOOGLE_CLIENT_ID` | **sim**     | Client ID do Google OAuth       |

## Scripts disponíveis

### Raiz do monorepo

| Script                | O que faz                                                |
|-----------------------|----------------------------------------------------------|
| `pnpm dev`            | Sobe backend + frontend em paralelo                      |
| `pnpm dev:frontend`   | Só Vite                                                  |
| `pnpm dev:backend`    | Só Nest (watch via nodemon)                              |
| `pnpm dev:shared`     | `tsc --watch` do shared                                  |
| `pnpm build`          | Build de todos os workspaces, em série                   |
| `pnpm build:frontend` | `tsc -b && vite build` no frontend                       |
| `pnpm build:backend`  | `nest build` no backend                                  |
| `pnpm build:shared`   | `tsc` no shared                                          |
| `pnpm install`        | Instala dependências de todos os workspaces              |

### Backend (`backend/`)

| Script              | O que faz                                  |
|---------------------|--------------------------------------------|
| `pnpm start:dev`    | Nest com hot reload via nodemon            |
| `pnpm start:debug`  | Idem, com flag `--debug` para anexar IDE   |
| `pnpm start`        | Nest sem watch                             |
| `pnpm start:prod`   | `node dist/main` (após build)              |
| `pnpm build`        | Compila para `dist/`                       |
| `pnpm typecheck`    | `tsc --noEmit`                             |
| `pnpm lint`         | ESLint flat config, `--max-warnings=0`     |
| `pnpm lint:fix`     | ESLint com `--fix`                         |
| `pnpm format`       | Prettier nos arquivos `src/**/*.ts`        |

### Frontend (`frontend/`)

| Script           | O que faz                              |
|------------------|----------------------------------------|
| `pnpm dev`       | Vite (`:5173`)                         |
| `pnpm build`     | `tsc -b && vite build`                 |
| `pnpm preview`   | Preview do build de produção           |
| `pnpm typecheck` | `tsc -b --noEmit`                      |
| `pnpm lint`      | ESLint                                 |

## Estrutura de pastas

```
bolao/
├── backend/
│   ├── src/
│   │   ├── main.ts                  Bootstrap, Helmet, CORS, Swagger
│   │   ├── app.module.ts            Composição raiz + APP_GUARD
│   │   ├── auth/
│   │   ├── user/
│   │   ├── team/
│   │   ├── stage/
│   │   ├── match/
│   │   ├── bet/
│   │   ├── ranking/
│   │   ├── stats/
│   │   ├── config/
│   │   ├── schedule/                Crons
│   │   ├── health/
│   │   └── common/                  Decorators, guards, filtros, utilidades
│   ├── static/                      Imagens estáticas (escudos, avatares)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx, main.tsx, router.tsx, index.css
│   │   ├── components/{ui,layout,shared,guards}
│   │   ├── features/{auth,home,bets,bolao,ranking,stats,admin}
│   │   ├── hooks/                   Wrappers React Query
│   │   ├── lib/                     api, format, scoring, stage, ranking, cn, assets
│   │   └── providers/               Theme, Auth, Query
│   └── .env.example
├── shared/
│   └── src/                         enums, DTOs, helpers de data, contratos de API
└── docs/                            Esta documentação
```

## Debug

### Backend

`pnpm start:debug` no backend roda Nest com `--debug`. Anexe o debugger da IDE (porta padrão 9229).

Logs são via `Logger` do Nest e o nível pode ser controlado pela env `LOG_LEVEL` (se configurado em `LoggerModule`; verifique o estado atual). Erros não tratados aparecem com stack completo via `AllExceptionsFilter`.

### Frontend

- Devtools do TanStack Query estão habilitadas em dev (`@tanstack/react-query-devtools`) — abra o painel flutuante no canto da página
- A Console mostra warnings de tipos do React 19 e mensagens do service worker (`vite-plugin-pwa`)
- Para limpar o service worker em dev, abra DevTools → Application → Service Workers → Unregister

## Fluxo "do zero ao primeiro palpite"

Para popular o ambiente local pela primeira vez:

1. Subir Mongo + backend + frontend (`docker compose up -d mongo && pnpm dev`)
2. Logar com sua conta Google → cria seu `User` (`isActive: false`)
3. Tornar-se admin manualmente no Mongo:
   ```js
   db.users.updateOne({ email: 'seu@email' }, { $set: { isAdmin: true, isActive: true } })
   ```
4. No frontend, ir para `/admin`:
   - Clicar **Importar Times** → popula seleções e escudos
   - Clicar **Importar Partidas** → cria o calendário (e cria as 7 fases via seed no boot, se ainda não criadas)
5. A fase `GROUP_STAGE` já vem `OPEN` no seed. Em `/apostas`, palpites em branco aparecem para você
6. Para forçar atualização de resultados de jogos já iniciados: **Atualizar Resultados** no Admin

## Atualizando o contrato compartilhado

1. Editar arquivos em `shared/src/`
2. Rodar `pnpm build:shared`
3. Backend (em watch) e frontend (Vite HMR) pegarão a nova versão automaticamente
4. Tratar os erros de tipo que aparecerem em ambos os lados
5. Em PRs, evitar misturar mudança de contrato com refactor de feature

## Convenções de código

- **Sem `any` na fronteira frontend↔backend.** Tudo passa por tipos de `@bolao/shared`.
- **Terminologia técnica em inglês** (módulos, classes, propriedades, rotas). **Terminologia de domínio na UI em PT-BR.**
- ESLint + Prettier no backend; ESLint apenas no frontend.
- Indentação com **tabs** (visível nos arquivos do projeto).
- No backend, services contêm regras de negócio. Controllers só fazem mapeamento HTTP ↔ DTO.
- No frontend, hooks de `src/hooks/` são a única forma de chamar a API a partir de componentes.

## Docker

`docker-compose.yml` na raiz sobe apenas o Mongo:

```bash
docker compose up -d mongo       # sobe
docker compose down              # mantém os dados
docker compose down -v           # apaga o volume do Mongo também
```

Backend e frontend ainda não estão no compose (em transição de UI/toolchain). A imagem do Mongo é `mongo:7`, com healthcheck via `mongosh ping` e volume nomeado `mongo-data`.
