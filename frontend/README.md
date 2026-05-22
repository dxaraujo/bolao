# CopaBet 2026 ⚽

Bolão da Copa do Mundo — React + Vite + Tailwind + shadcn/ui

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Estilo | Tailwind CSS v3 |
| Componentes | shadcn/ui (New York) |
| Gráficos | Recharts |
| Ícones | Lucide React |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis (copie .env.example → .env)
cp .env.example .env
# VITE_GOOGLE_CLIENT_ID = mesmo valor de GOOGLE_CLIENT_ID do backend

# 3. Subir backend (porta 3001) e MongoDB — ver backend/README.md

# 4. Rodar em modo desenvolvimento (proxy /api e /auth → backend)
npm run dev

# 5. Build de produção
npm run build
```

## Estrutura

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx       # Header com logo + toggle de tema
│   │   └── BottomNav.tsx    # Navegação inferior (5 abas)
│   ├── shared/
│   │   ├── Avatar.tsx       # Avatar do jogador
│   │   ├── LiveDot.tsx      # Indicador de jogo ao vivo
│   │   └── StageBadge.tsx   # Badge OPEN/BLOCKED/DISABLED
│   └── ui/                  # shadcn/ui (Button, Badge, Card, Progress)
├── api/
│   ├── client.ts            # Fetch + JWT
│   └── types.ts             # Tipos da API
├── context/
│   └── AppDataContext.tsx   # Dados compartilhados das telas
├── hooks/
│   └── useTheme.ts          # Toggle dark/light com persistência
├── lib/
│   ├── utils.ts             # cn() helper
│   └── bet.ts               # Lógica de resultado e pontuação
├── screens/
│   ├── LoginScreen.tsx      # POST /auth/google
│   ├── HomeScreen.tsx       # GET /api/match/visible
│   ├── BetsScreen.tsx       # GET+PUT /api/bet/updateBets
│   ├── BolaoScreen.tsx      # Palpites de todos por partida
│   ├── RankingScreen.tsx    # GET /api/user/active
│   └── StatsScreen.tsx      # Gráficos e estatísticas
└── types/
    └── index.ts             # Tipos TypeScript (Stage, Match, User…)
```

## Rotas da API

| Rota | Tela |
|------|------|
| `POST /auth/google` | LoginScreen |
| `GET /api/user/authenticated` | Header (perfil) |
| `GET /api/user/active` | RankingScreen |
| `GET /api/stage/visible` | BetsScreen, BolaoScreen |
| `GET /api/match/visible` | HomeScreen, BetsScreen |
| `GET /api/bet` | BetsScreen, BolaoScreen |
| `PUT /api/bet/updateBets` | BetsScreen (salvar) |
| `GET /api/config` | Pontuação (5/2/0) |

## Integração com API

A aplicação consome as rotas do backend NestJS via `src/api/client.ts`. Em desenvolvimento, o Vite faz proxy de `/api` e `/auth` para `http://localhost:3001`.

Login: Google Identity Services → `POST /auth/google` → JWT em `localStorage` (`copabet_token`).

## PWA

Para habilitar PWA, adicione `vite-plugin-pwa`:

```bash
npm install -D vite-plugin-pwa
```

E configure em `vite.config.ts` com `VitePWA({ registerType: 'autoUpdate', ... })`.
