# Especificação — Usuários (`user`)

- **ID:** SPEC-USER
- **Backend:** `backend/src/user/` (`user.controller.ts`, `user.service.ts`, `schemas/user.schema.ts`, `dto/update-user.dto.ts`)
- **Shared:** `UserPayload`, `AuthenticatedUser` (`dto.ts`)
- **Visão geral:** [`README.md`](./README.md) (espectadores, fluxo "Ativar/desativar")

## 1. Objetivo

Gerir a identidade do usuário (criada/atualizada no login Google) e o flag de participação que controla quem palpita e entra no ranking. Sem nenhum side-effect sobre `Bet`.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/user/me` | JWT |
| `GET /api/user/active` | JWT |
| `GET /api/user` | Admin |
| `PATCH /api/user/:id` | Admin |

## 3. Modelo de dados — `User` (timestamps)

| Campo | Tipo | Regra |
|---|---|---|
| `googleSub` | string | **único**, indexado |
| `name` | string | obrigatório |
| `givenName` | string? | primeiro nome (UIs compactas, ex. pódio) |
| `email` | string | obrigatório |
| `picture` | string? | URL Google original (pré-download) |
| `avatar` | string? | path local `/static/users/<id>.<ext>` |
| `isAdmin` | boolean | default `false` |
| `isActive` | boolean | default `false` (**pagante/participante**) |
| `participationChangedAt` | Date? | última transição de `isActive` |

`UserPayload` (resposta) = campos públicos + `participationChangedAt?` + `createdAt` (sem `googleSub`/`picture`).

## 4. Contratos

- **`PATCH /api/user/:id`** — `UpdateUserDto { isActive?: boolean, isAdmin?: boolean }` (ambos `@IsOptional @IsBoolean`).

## 5. Requisitos funcionais

- **RF-USER-1** — `GET /api/user/me` retorna o `UserPayload` do usuário do JWT.
- **RF-USER-2** — `GET /api/user/active` retorna apenas usuários com `isActive: true`.
- **RF-USER-3** — `GET /api/user` (admin) retorna todos os usuários.
- **RF-USER-4** — `PATCH /api/user/:id` (admin) atualiza `isActive`/`isAdmin`.
- **RF-USER-5** — Upsert no login (`upsertFromGoogle`): cria por `googleSub` ou atualiza `name/givenName/email/picture`; baixa avatar via `MediaService` quando a URL externa muda.

## 6. Regras de negócio

- **RN-USER-1** — Usuário novo nasce **espectador** (`isActive: false`, `isAdmin: false`).
- **RN-USER-2** — Alterar `isActive` atualiza `participationChangedAt` e **dispara `LeaderboardService.rebuild()`** (entrada/saída do ranking).
- **RN-USER-3** — Mudar participação **não** altera nenhum `Bet`. Palpites antigos permanecem; reativar reincorpora o histórico no ranking.
- **RN-USER-4** — `isActive` é o único gate de palpite e de presença no leaderboard/cross-table do bolão.
- **RN-USER-5** — Auto-correção no boot (`onModuleInit` → `syncMissingAvatars`): re-baixa avatares cujo arquivo local sumiu mas o registro aponta para `/static/`.

## 7. Casos de borda e erros

- **CB-USER-1** — `:id` inválido (não-ObjectId) ou inexistente → `404`.
- **CB-USER-2** — Admin se autodesativa: permitido; some do ranking, mantém `isAdmin`.

## 8. Dependências

- [auth](./auth.spec.md) (upsert no login), [leaderboard](./leaderboard.spec.md) (rebuild ao mudar `isActive`), `media` (download de avatar).
