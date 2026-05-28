# Especificação — Partidas (`match`)

- **ID:** SPEC-MATCH
- **Backend:** `backend/src/match/` (`match.controller.ts`, `match.service.ts`, `schemas/match.schema.ts`)
- **Shared:** `MatchStatus` (`enums.ts`); `mapExternalStatus`, `isCanonicalTransition`, `CANONICAL_TRANSITIONS`, `EXTERNAL_STATUSES` (`match-status.ts`); `MatchPayload`, `Score` (`dto.ts`/`scoring.ts`)
- **Doc narrativa:** [`docs/dominio.md`](../docs/dominio.md), [`docs/arquitetura.md`](../docs/arquitetura.md)

## 1. Objetivo

Importar o calendário e placares da Football Data API, normalizando status externo para 4 valores internos e mantendo as FKs de fase/times resolvidas.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/match` | JWT |
| `POST /api/match/import` | Admin |

Também importado pelo `Sistema` (bootstrap + cron `*/5`).

## 3. Modelo de dados — `Match` (timestamps)

| Campo | Tipo | Regra |
|---|---|---|
| `footballDataId` | number | **único** (índice explícito) |
| `utcDate` | Date | indexado |
| `status` | `MatchStatus` | `SCHEDULED \| LIVE \| FINISHED \| CANCELLED`, indexado |
| `stage` | ObjectId → Stage | FK obrigatória, indexada |
| `group` | string? | só em `GROUP_STAGE` (ex. `GROUP_A`) |
| `homeTeam`, `awayTeam` | ObjectId → Team | **obrigatórias** (TBD não é importada) |
| `score` | `{ home, away }?` | subdoc `_id:false`, `min:0`; só em LIVE/FINISHED |
| `externalLastUpdated` | Date | obrigatório |

Índice composto `{ stage, utcDate }`. `MatchPayload` projeta `stage` como `code`, embute `stageState` e popula `homeTeam`/`awayTeam` como `TeamPayload`.

## 4. De-para de status — `mapExternalStatus`

```
TIMED, SCHEDULED, POSTPONED  → SCHEDULED
IN_PLAY, PAUSED              → LIVE
FINISHED, AWARDED            → FINISHED
CANCELLED, SUSPENDED         → CANCELLED
desconhecido                 → SCHEDULED  (defensivo, deve gerar log)
```

## 5. Requisitos funcionais

- **RF-MATCH-1** — `GET /api/match` retorna `MatchPayload[]` com `stageState` derivado por partida e `score` quando presente.
- **RF-MATCH-2** — `POST /api/match/import` busca `GET {API}/competitions/WC/matches?season=2026` e faz upsert por `footballDataId`; retorna `{ imported, skipped, changedIds }`.
- **RF-MATCH-3** — Quando `changedIds.length > 0`, o import dispara `LeaderboardService.rebuild()` + `systemState.leaderboardRebuilt()`; sempre marca `systemState.matchImported()`.

## 6. Regras de negócio

- **RN-MATCH-1** — Partida é **skipada** se a `stage` externa não está no enum `MatchStage` **ou** se algum time é TBD (não resolve por `footballDataId`). Conta em `skipped`.
- **RN-MATCH-2** — `score` só é extraído (`extractScore`) para LIVE/FINISHED com `fullTime.home/away` válidos.
- **RN-MATCH-3** — Transições não-canônicas (`isCanonicalTransition(from,to) === false`, ex. `FINISHED → SCHEDULED`) são **aceitas** mas geram warning — o provedor é fonte de verdade. Canônicas: `SCHEDULED→{LIVE,FINISHED,CANCELLED}`, `LIVE→{FINISHED,CANCELLED}`; `FINISHED`/`CANCELLED` são terminais.
- **RN-MATCH-4** — Resiliência ao "score fantasma": se a partida tinha `score` e o externo deixou de ter, o update faz `$unset: { score: 1 }` explícito (Mongoose ignora `undefined` em `$set`).
- **RN-MATCH-5** — `changedIds` recebe o `_id` apenas quando há mudança real (status, score ou `utcDate`).
- **RN-MATCH-6** — Não há criação manual de partidas nem endpoints de simulação — toda partida vem do provedor.

## 7. Casos de borda e erros

- **CB-MATCH-1** — `POSTPONED` → `SCHEDULED` (sem score); palpites seguem válidos.
- **CB-MATCH-2** — `CANCELLED` → sem score; avaliada como `wrong` no rebuild (sem placar válido).
- **CB-MATCH-3** — Time TBD em eliminatória → partida ignorada até ambos resolverem.
- **CB-MATCH-4** — Schema externo divergente → `TypeError` capturado pelo `try/catch`, logado como erro; estado local inalterado.

## 8. Dependências

- [team](./team.spec.md) (resolução de FK), [stage](./stage.spec.md) (FK + `stageState`), [leaderboard](./leaderboard.spec.md) (rebuild), [sync](./sync.spec.md).
