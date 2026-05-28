# Especificações do sistema — Bolão da Copa 2026

App privado para amigos e família apostarem nos jogos da Copa do Mundo FIFA 2026. Não é produto público — sem moderação, anti-fraude ou escala massiva.

Esta pasta é a **fonte única** de documentação do sistema: uma visão geral transversal (abaixo) + uma **especificação formal por módulo** (índice ao final). O código é a fonte de verdade; quando divergir da spec, atualize a spec.

```
.
├── backend/    NestJS 10 + TS 5 + Mongoose 8 (MongoDB)
├── frontend/   React 19 + Vite 7 + TS 5 + Tailwind v4 + shadcn/ui (PWA mobile-first)
└── shared/     @bolao/shared — enums, DTOs e funções puras compartilhadas
```

> Setup, variáveis de ambiente e scripts ficam no [`README.md`](../README.md) raiz. Referência viva de endpoints: Swagger em `/api/docs`.

---

## Visão geral do sistema

### Glossário

| Termo (PT-BR) | Identificador | Significado |
|---|---|---|
| Usuário | `User` | Pessoa autenticada via Google |
| Participante | `User.isActive: true` | Usuário pagante — palpita e entra no ranking |
| Espectador | `User.isActive: false` | Vê tudo, mas não palpita nem aparece no ranking |
| Seleção | `Team` | Time da Copa |
| Partida | `Match` | Jogo entre duas seleções |
| Fase | `Stage` | Etapa da competição (grupos, oitavas, …) |
| Palpite | `Bet` | Previsão de placar de um participante para uma partida |
| Ranking | `Leaderboard` | View materializada do ranking + breakdown |
| Estado da fase | derivado | `LOCKED`/`OPEN`/`CLOSED` computado em tempo real |

### Princípio norteador

> **O palpite é a única coisa que o usuário cria; tudo o mais é derivável.**
> `Match`/`Stage`/`Team` vêm do provedor externo, `Bet` é input do usuário, e ranking + estatísticas + estado da fase são views materializadas a partir desses três.

### Arquitetura

Cliente-servidor em **monorepo pnpm** (3 workspaces). O frontend é um SPA mobile-first (PWA) que fala HTTP/JSON com o backend; o backend persiste em MongoDB e integra a Football Data API.

```
          Football Data API
                 │ HTTP/JSON (X-Auth-Token)
                 ▼
 Frontend ◀────▶ Backend ◀────▶ MongoDB
 React/PWA  /api  NestJS   Mongoose
     │      /auth  JWT + crons
     ▼
 Google Identity (verifyIdToken)
```

- **Backend** — `JwtAuthGuard` global (`APP_GUARD`); `ValidationPipe` global (`whitelist`, `transform`); `AllExceptionsFilter`; Helmet + CORS; Swagger em `/api/docs` quando `NODE_ENV !== 'production'`. Cada módulo: `*.controller.ts` (HTTP/guards) · `*.service.ts` (regra + Mongoose) · `schemas/` · `dto/`.
- **Frontend** — React Router v7 (`createBrowserRouter`), TanStack Query v5 (hooks em `src/hooks/`), `lib/api.ts` (fetch + JWT + envelope), proxy de `/api`,`/auth`,`/healthcheck` para `:3000` em dev.
- **Estáticos** — backend serve `/static/users/<id>.<ext>` (avatares) e `/static/teams/<TLA>.png` (escudos) de `STATIC_DIR`; download em `common/download.ts`, com auto-correção no boot (re-baixa o que sumiu do disco).

### Fluxos transversais

1. **Login** — frontend pega ID token do Google → `POST /auth/google` → backend verifica, faz upsert de `User` por `googleSub`, baixa avatar, emite JWT `{ _id, name, email, avatar?, isAdmin, isActive }`. Novos usuários nascem espectadores.
2. **Apostar** (só participantes) — `PUT /api/bet { items }` → validação por item (usuário ativo, partida com times resolvidos, fase `OPEN`, status `SCHEDULED`, score `0..20`) → `bulkWrite` ordenado (score→upsert, null→delete), tudo-ou-nada.
3. **Sincronização** — `MatchSyncTask` (bootstrap + cron `*/5 * * * *`): `importTeams` + `importMatches`; se houve mudança, `LeaderboardService.rebuild()`. Marca timestamps em `SystemState`. Frontend (`useWatchResults`) faz poll de `/api/system/state` a cada 30s e invalida caches quando `leaderboardRebuildAt` muda.
4. **Mudança de estado da fase** — não há abrir/fechar manual; o estado é derivado de `deadline`+`now`+predecessora a cada request. Admin ajusta `deadline` via `PATCH /api/stage/:code`.
5. **Ativar/desativar usuário** — `PATCH /api/user/:id { isActive }` atualiza o flag + `participationChangedAt` e dispara rebuild do ranking. **Sem side-effect em `Bet`** — reativar reincorpora o histórico.

### Espectadores (`isActive: false`)

| Recurso | Espectador | Participante |
|---|---|---|
| Ver home, ranking, bolão, stats | ✓ | ✓ |
| Acessar `/apostas` | ✗ (redireciona) | ✓ |
| Aparecer no ranking | ✗ | ✓ |
| Aparecer no cross-table do bolão | ✗ | ✓ |

Header mostra badge **"Espectador"**; BottomNav esconde a aba "Apostas".

---

## Como ler as specs

- **IDs:** `RF-<MOD>-<n>` requisito funcional · `RN-<MOD>-<n>` regra de negócio · `CB-<MOD>-<n>` caso de borda.
- **Atores:** `Espectador` · `Participante` · `Admin` · `Sistema` (crons/bootstrap) · `Provedor` (Football Data API).
- **Envelope HTTP:** sucesso `{ data: T }`; erro `{ errors, statusCode, path, timestamp, requestId? }`.
- **Auth:** `JwtAuthGuard` global — toda rota exige JWT salvo as `@Public()`; `AdminGuard`/`ActiveParticipantGuard` sobre handlers.

## Índice de specs

| Spec | Módulo | Escopo |
|---|---|---|
| [auth](./auth.spec.md) | `auth` | Login Google → JWT, guards, rotas públicas |
| [user](./user.spec.md) | `user` | Identidade, participação (ativo/espectador), admin, avatar |
| [team](./team.spec.md) | `team` | Seleções, import, bandeira preferencial sobre escudo |
| [stage](./stage.spec.md) | `stage` | Fases, estado derivado `LOCKED/OPEN/CLOSED`, seed, deadline |
| [match](./match.spec.md) | `match` | Partidas, import, status interno, transições |
| [bet](./bet.spec.md) | `bet` | Palpites esparsos, submit tudo-ou-nada, visão de grupo |
| [scoring](./scoring.spec.md) | `@bolao/shared` | `calculateBetScore`, desempate, função pura |
| [leaderboard](./leaderboard.spec.md) | `leaderboard` | Ranking singleton + estatísticas derivadas |
| [sync](./sync.spec.md) | `schedule` + `system-state` | Cron unificada, Football Data, timestamps de sync |
| [frontend](./frontend.spec.md) | `frontend` | Rotas, guards, telas, watch de resultados, PWA |

## Contratos compartilhados

Todo tipo que cruza a fronteira frontend↔backend vive em `@bolao/shared` (`shared/src/`). As specs referenciam esses símbolos pelo nome; a definição canônica está em `dto.ts`, `enums.ts`, `scoring.ts`, `stage-state.ts`, `match-status.ts`, `flag-emoji.ts`, `api.ts`, `date.ts`.
