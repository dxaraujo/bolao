# Bolão Frontend

SPA React + Vite + TypeScript para apostas no bolão da Copa do Mundo.

## Stack

- **React 19** + **TypeScript 5.7** + **Vite 6**
- **Redux Toolkit 2** + **react-redux 9** com `withTypes`
- **React Router v7**
- **Tailwind CSS v4** + **shadcn/ui** (foundation pronta, telas sendo migradas)
- **date-fns 4** para datas
- **jwt-decode 4** para token JWT
- **Google OAuth** via `@react-oauth/google`

> Telas ainda em transição: módulos antigos (CoreUI v2, Bootstrap, reactstrap) coexistem com a foundation shadcn/ui enquanto as features são migradas uma a uma.

## Pré-requisitos

- Node.js >= 20
- Backend rodando (ver `../bolaoBackend/`)

## Setup

```bash
cp .env.example .env
# editar .env com seus valores (apontar VITE_BACKEND_URI para o backend)

pnpm install
pnpm dev
```

A app sobe em http://localhost:3000.

## Scripts

| Script         | O que faz                                |
|----------------|------------------------------------------|
| `pnpm dev`     | Dev server Vite com HMR                  |
| `pnpm start`   | Alias para `pnpm dev`                    |
| `pnpm build`   | `tsc -b && vite build` para `build/`     |
| `pnpm preview` | Servir o build pronto localmente         |

## Variáveis de ambiente

Todas com prefixo `VITE_` (exigência do Vite). Ver [`.env.example`](.env.example).

| Variável                | Default                                |
|-------------------------|----------------------------------------|
| `VITE_BACKEND_URI`      | `http://127.0.0.1:3001`                |
| `VITE_ROOT_USER`        | `danielxaraujo@gmail.com`              |
| `VITE_ENVIRONMENT`      | `DEVELOPMENT`                          |
| `VITE_GOOGLE_CLIENT_ID` | (Google OAuth Client ID)               |

## Estrutura

```
src/
├── main.tsx               Bootstrap React + Redux + Google OAuth + CSS
├── App.tsx                Top-level router (BrowserRouter + login / FullLayout)
├── index.css              Tailwind v4 + tema shadcn (vars CSS, dark mode)
├── app/
│   ├── store.ts           Redux store + middleware de loading
│   ├── hooks.ts           useAppDispatch/useAppSelector tipados
│   ├── auth/              authService + authSlice + withAuth HOC
│   ├── config/            config (env), navigation, router
│   ├── components/        Componentes compartilhados (if, etc.)
│   ├── layout/            fullLayout + header + footer
│   └── util/fetch.ts      authFetch helper
├── features/              Cada feature tem .tsx + slice
│   ├── classificacao/
│   ├── dashboard/
│   ├── disputa/
│   ├── fase/
│   ├── loading/
│   ├── login/
│   ├── palpite/
│   ├── partida/
│   ├── time/
│   └── user/
├── components/ui/         Componentes shadcn/ui (gerados via CLI)
└── lib/utils.ts           Helper `cn()` para classes Tailwind
```

## Adicionando componentes shadcn/ui

```bash
pnpm dlx shadcn@latest add button card input label dialog
```

Eles são gerados em `src/components/ui/`.
