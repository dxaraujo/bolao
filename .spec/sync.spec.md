# Especificação — Sincronização e Estado do Sistema (`sync`)

- **ID:** SPEC-SYNC
- **Backend:** `backend/src/schedule/` (`match-sync.task.ts`, `schedule.module.ts`), `backend/src/system-state/` (`system-state.controller.ts`, `system-state.service.ts`, `schemas/system-state.schema.ts`)
- **Shared:** `SystemStatePayload` (`dto.ts`)
- **Visão geral:** [`README.md`](./README.md) (fluxo de sincronização)

## 1. Objetivo

Manter calendário, placares e ranking em dia via uma **única** cron e expor timestamps de sincronização para o frontend reagir a novos resultados.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/system/state` | JWT |

`Sistema` (cron + bootstrap) é o único disparador automático; `Provedor` = Football Data API.

## 3. Modelo de dados — `SystemState` (singleton, `key: 'singleton'`)

| Campo | Tipo |
|---|---|
| `scoreSyncStartedAt` | Date \| null |
| `scoreSyncCompletedAt` | Date \| null |
| `leaderboardRebuildAt` | Date \| null |
| `lastMatchImportAt` | Date \| null |

`SystemStatePayload` = os 4 timestamps (ISO) + `scoringInProgress` derivado.

## 4. Integração externa

- Base `FOOTBALL_DATA_API_URL`; header `X-Auth-Token: FOOTBALL_DATA_API_KEY`.
- `GET {API}/competitions/WC/teams?season=2026` e `.../matches?season=2026`.
- Chave lida via `ConfigService.getOrThrow` — boot falha se ausente.

## 5. Requisitos funcionais

- **RF-SYNC-1** — `MatchSyncTask.onApplicationBootstrap`: na subida roda `teamService.importTeams()` e depois `runSync()`.
- **RF-SYNC-2** — `@Cron('*/5 * * * *')` invoca `runSync()` a cada 5 minutos.
- **RF-SYNC-3** — `runSync()` em ordem: `scoreSyncStarted()` → `importMatches()` → `matchImported()` → se `changedIds>0`: `rebuild()` + `leaderboardRebuilt()` → `finally scoreSyncCompleted()`.
- **RF-SYNC-4** — `GET /api/system/state` retorna os timestamps + `scoringInProgress`.
- **RF-SYNC-5** — `scoringInProgress = !!scoreSyncStartedAt && (!scoreSyncCompletedAt || scoreSyncStartedAt > scoreSyncCompletedAt)`.

## 6. Regras de negócio

- **RN-SYNC-1** — A cron `MatchSyncTask` é a **única** responsável por import + rebuild automáticos (não há tasks separadas por etapa).
- **RN-SYNC-2** — Idempotência: import só escreve no diff; `rebuild()` recomputa do zero.
- **RN-SYNC-3** — `scoreSyncCompletedAt` é marcado no `finally` — mesmo com erro no import, o ciclo "fecha".
- **RN-SYNC-4** — Falhas (bootstrap ou tick) são capturadas e logadas; nunca derrubam o processo.
- **RN-SYNC-5** — Custo: ~1 request/5min ≈ 288/dia, dentro do plano gratuito típico.

## 7. Casos de borda

- **CB-SYNC-1** — Provedor fora do ar → warning, estado local inalterado, próximo tick tenta de novo.
- **CB-SYNC-2** — Import sem mudanças → `rebuild` **não** roda; `leaderboardRebuildAt` não muda → frontend não invalida.
- **CB-SYNC-3** — Dois ciclos sobrepostos: `scoringInProgress` reflete o último `started` ainda não `completed`.

## 8. Interação com o frontend

`useWatchResults` consulta `GET /api/system/state` a cada **30s** (e em foco). Quando `leaderboardRebuildAt` muda, exibe toast "Resultados atualizados" e invalida `['bets']`, `['leaderboard']`, `['matches']`, `['stages']`. Ver [frontend](./frontend.spec.md).

## 9. Dependências

- [team](./team.spec.md), [match](./match.spec.md), [leaderboard](./leaderboard.spec.md).
