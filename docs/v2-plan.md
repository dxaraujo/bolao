# Plano v2 — Refactor estrutural

Branch: `v2`. Banco novo: `bolao_v2`. Sem migrations — sistema é tratado como nova versão do zero.

## Princípio norteador

> O palpite é a única coisa que o usuário cria; tudo o mais é derivável.
> `Match`/`Stage`/`Team` vêm do provedor externo, `Bet` é input do usuário,
> e ranking + estatísticas + estado da fase são views materializadas a partir desses três.

## Decisões consolidadas (30)

| # | Decisão |
|---|---|
| 1 | `LIVE` **também pontua** (ranking em tempo real) |
| 2 | `Bet` exige ambos os scores preenchidos |
| 3 | `PUT /api/bet` com `score: null` deleta o bet |
| 4 | Cap `0..20` integers |
| 5 | Pontuação constante no shared, sem override runtime |
| 6 | Espectador **não acessa** `/apostas` |
| 7 | Badge "Espectador" no header |
| 8 | Contador "X de Y partidas" no header da tab da fase |
| 9 | Refetch automático em `/apostas` a cada 60s |
| 10 | `Match.score` = subdocumento `{home, away}` |
| 11 | `Bet.score` = mesmo subdocumento |
| 12 | `Match.stage` = FK real `ObjectId → Stage` |
| 13 | `User.avatar` = campo único |
| 14 | `Team` usa emoji de bandeira (🇧🇷, 🇦🇷, …) — fallback crest |
| 15 | `expectedMatchCount` fica no schema `Stage` |
| 16 | `User.participationChangedAt` único (sem `activatedAt`) |
| 17 | `Leaderboard` singleton |
| 18 | `SystemState` collection nova |
| 19 | `SystemState` usa timestamps (`syncStartedAt`/`syncCompletedAt`) |
| 20 | `LeaderboardService.rebuild()` síncrono |
| 21 | `MatchSyncTask` 24/7 `*/5 * * * *` |
| 22 | `MatchImportTask` `*/15 * * * *` fixo |
| 23 | `ActiveParticipantGuard` checa JWT + service rebusca defensivo |
| 24 | `PATCH /api/stage/:code` na v2 |
| 25 | `GET /api/admin/stage/readiness` na v2 |
| 26 | BottomNav esconde aba "Apostas" para espectador |
| 27 | `Match.status` segue workflow com warning em transições não-canônicas |
| 28 | Banco novo (`bolao_v2`) |
| 29 | Todas as 9 ondas |
| 30 | Documentação atualizada no fim |

## Modelos finais

### `User`
```ts
{ _id, googleSub: string unique, name, email, avatar?,
  isAdmin: boolean, isActive: boolean,
  participationChangedAt?: Date, createdAt, updatedAt }
```

### `Team`
```ts
{ _id, footballDataId: number unique, name, shortName, tla,
  flagEmoji?: string, crest?: string,
  externalLastUpdated: Date, createdAt, updatedAt }
```

### `Stage`
```ts
{ _id, code: MatchStage, order: 1..7, deadline: Date,
  expectedMatchCount: number, createdAt, updatedAt }
```

### `Match`
```ts
{ _id, footballDataId: number unique, utcDate: Date,
  status: 'SCHEDULED'|'LIVE'|'FINISHED'|'CANCELLED',
  stage: ObjectId → Stage, group?: string,
  homeTeam: ObjectId → Team (obrigatório),
  awayTeam: ObjectId → Team (obrigatório),
  score?: { home: number, away: number },
  externalLastUpdated: Date, createdAt, updatedAt }
```

### `Bet`
```ts
{ _id, user: ObjectId → User, match: ObjectId → Match,
  score: { home: number, away: number }, createdAt, updatedAt }
// index { user, match } UNIQUE
```

### `Leaderboard` (singleton)
```ts
{ key: 'singleton', generatedAt: Date,
  rows: [{ user, points, breakdown:{exact,winnerWithGoal,correctWinner,oneGoalCorrect,wrong}, rank }] }
```

### `SystemState` (singleton)
```ts
{ key: 'singleton',
  scoreSyncStartedAt?, scoreSyncCompletedAt?,
  leaderboardRebuildAt?, lastMatchImportAt?,
  createdAt, updatedAt }
```

## State machines

### `Stage` (3 estados, função pura)
```
LOCKED  → now < prev.deadline
OPEN    → now >= prev.deadline AND now < deadline
CLOSED  → now >= deadline
```
Exceção: `FINAL` referencia `SEMI_FINALS` como prev.

### `Match.status` — transições com warning

| De → Para | SCHEDULED | LIVE | FINISHED | CANCELLED |
|---|---|---|---|---|
| SCHEDULED | — | ✓ | ✓ | ✓ |
| LIVE | ⚠ | — | ✓ | ✓ |
| FINISHED | ⚠ | ⚠ | — | ⚠ |
| CANCELLED | ⚠ | ⚠ | ⚠ | — |

Importador aceita todas; loga warning quando não-canônica.

### `mapExternalStatus` (Football Data → interno)
```
TIMED, SCHEDULED, POSTPONED  → SCHEDULED
IN_PLAY, PAUSED              → LIVE
FINISHED, AWARDED            → FINISHED
CANCELLED, SUSPENDED         → CANCELLED
```

## Validações de palpite (`BetService.submit`)

1. `ActiveParticipantGuard` (JWT)
2. Defensivo: `User.findById` e `isActive`
3. Cada item: integers `0..20`, ambos ou ambos nulos
4. Match existe, com homeTeam/awayTeam resolvidos
5. `getStageState === 'OPEN'`
6. `match.status === 'SCHEDULED'`
7. bulkWrite ordenado: null → delete, valor → upsert

## Endpoints v2

```
# Público
POST /auth/google
GET  /healthcheck

# Autenticado
GET  /api/user/me
GET  /api/stage
GET  /api/match
GET  /api/bet
GET  /api/bet/all
GET  /api/leaderboard
GET  /api/leaderboard/stats/overview
GET  /api/leaderboard/stats/accuracy-by-user
GET  /api/leaderboard/stats/distribution
GET  /api/system/state

# Participante ativo (ActiveParticipantGuard)
PUT  /api/bet

# Admin
GET   /api/user
PATCH /api/user/:id
PATCH /api/stage/:code
GET   /api/stage/readiness
POST  /api/team/import
POST  /api/match/import
POST  /api/match/sync-scores
POST  /api/leaderboard/rebuild
```

## Frontend — guards e navegação

| Path | Guard |
|---|---|
| /login | PublicOnly |
| / | Protected |
| /apostas | **Active** |
| /bolao, /ranking, /stats | Protected |
| /admin | Admin |

- BottomNav esconde "Apostas" se `!isActive`.
- Header mostra badge "Espectador" se `!isActive`.
- Team usa `flagEmoji` quando disponível; fallback `crest`.

## Ondas

1. **Shared & contratos** — enums, constantes, funções puras, DTOs
2. **Modelos & DB** — schemas v2, banco novo, seed stages
3. **Auth, User, Media** — UserService enxuto, MediaService
4. **Stage + Match + Import** — estado derivado, skip TBD, workflow status
5. **Bet + validações** — submit validado, unique index, left-joins
6. **Leaderboard + Scoring** — singleton + rebuild, stats derivadas
7. **Crons + SystemState** — 2 crons, sem block stages, readiness endpoint
8. **Frontend** — guards, badges, banner, emoji, contadores, refetch 60s
9. **Documentação** — reescrever docs/

## Crons

| Task | Cron | Função |
|---|---|---|
| `MatchSyncTask` | `*/5 * * * *` (24/7) | Sync scores → rebuild leaderboard se mudou |
| `MatchImportTask` | `*/15 * * * *` | Reimporta calendário |

**Sem `BlockStagesTask`** — estado de fase é derivado em todo request.

## O que é removido vs hoje

| Hoje | v2 |
|---|---|
| `seedBetsForStage`, `seedBetsForUser`, `removeBetsForUser` | deletado — bets esparsos |
| User: `exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`, `totalPointsEarned`, `ranking` | deletado — view `Leaderboard` |
| Bet: `exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`, `totalPointsEarned` | deletado — derivado por `calculateBetScore` |
| `Stage.status` (DISABLED/OPEN/BLOCKED) + `BlockStagesTask` | derivado por `getStageState` |
| `Match.valid` | deletado — só importa partidas com times resolvidos |
| Módulo `ranking`, `stats` | unificados em `leaderboard` |
| Módulo `config` (com pontos duplicados) | substituído por `system-state` + constantes no shared |
| `MatchStatus` (9 valores externos) | reduzido para 4 internos via `mapExternalStatus` |
| Side-effects pesados em `PATCH /api/user/:id` | nenhum |
