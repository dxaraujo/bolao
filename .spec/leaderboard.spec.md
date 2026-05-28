# Especificação — Ranking e Estatísticas (`leaderboard`)

- **ID:** SPEC-LEADERBOARD
- **Backend:** `backend/src/leaderboard/` (`leaderboard.controller.ts`, `leaderboard.service.ts`, `schemas/leaderboard.schema.ts`)
- **Shared:** `LeaderboardPayload`, `LeaderboardItem`, `StatsOverview`, `UserAccuracy`, `Distribution` (`dto.ts`); `compareLeaderboardRows`, `LeaderboardBreakdown` (`scoring.ts`)
- **Doc narrativa:** [`docs/dominio.md`](../docs/dominio.md) (princípio norteador, fluxos)

## 1. Objetivo

Materializar o ranking como singleton recomputado sob demanda e derivar estatísticas agregadas. Substitui os antigos módulos `ranking/` e `stats/` da v1.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/leaderboard` | JWT |
| `GET /api/leaderboard/stats/overview` | JWT |
| `GET /api/leaderboard/stats/accuracy-by-user` | JWT |
| `GET /api/leaderboard/stats/distribution` | JWT |
| `POST /api/leaderboard/rebuild` | Admin |

## 3. Modelo de dados — `Leaderboard` (singleton, `key: 'singleton'`)

```ts
{ key, generatedAt: Date, rows: [{ user: ObjectId, points, breakdown: {exactScore,winnerWithGoal,correctWinner,oneGoalCorrect,wrong}, rank }] }
```

`LeaderboardPayload` hidrata `user` para `{ _id, name, givenName?, avatar? }`.

## 4. Requisitos funcionais

- **RF-LB-1** — `rebuild()` recomputa do zero: para cada usuário **ativo**, soma pontos sobre partidas pontuáveis × bets, persiste no singleton e retorna `LeaderboardPayload`.
- **RF-LB-2** — `GET /api/leaderboard` lê o singleton; se ausente, retorna `{ generatedAt: epoch, rows: [] }`.
- **RF-LB-3** — `POST /api/leaderboard/rebuild` (admin) força o recomputo.
- **RF-LB-4** — `stats/overview` → `StatsOverview { totalMatches, finishedMatches, totalExactBets, pointsInPlay, groupAccuracyPct }`.
- **RF-LB-5** — `stats/accuracy-by-user` → `UserAccuracy[]` ordenado por `compareLeaderboardRows` (desempate por `name` pt-BR).
- **RF-LB-6** — `stats/distribution` → `Distribution` (contagem + % por categoria sobre o total avaliado).

## 5. Regras de negócio

- **RN-LB-1** — **Só participantes ativos** entram. 0 ativos → singleton com `rows: []`.
- **RN-LB-2** — **Partida pontuável** = `status ∈ {LIVE, FINISHED}` **e** `score` presente. **LIVE pontua** (ranking em tempo real).
- **RN-LB-3** — Ordenação e desempate via `compareLeaderboardRows` (`points → exactScore → winnerWithGoal → correctWinner → oneGoalCorrect`).
- **RN-LB-4** — Ranking com empates: linhas empatadas compartilham o mesmo `rank`; o próximo rank pula pela quantidade de empatados (1,1,3,…).
- **RN-LB-5** — `rebuild()` é idempotente (recomputo total). Disparado por: sync com `changedIds>0`, `POST /import`, `POST /rebuild`, e mudança de `isActive` de usuário.
- **RN-LB-6** — `totalMatches` em overview = soma de `STAGE_EXPECTED_MATCHES` (não importados); `pointsInPlay = (totalMatches − finishedMatches) × 5`.
- **RN-LB-7** — `accuracyPct` por usuário = `round(exactScore / totalBets × 100)` (`totalBets` = bets sobre partidas pontuáveis); `groupAccuracyPct` overview = acertos (qualquer categoria ≠ wrong) / avaliados.

## 6. Casos de borda

- **CB-LB-1** — Nenhuma partida pontuável → todos com 0 pts; ranking por `name`.
- **CB-LB-2** — Usuário ativo sem nenhum palpite → aparece com 0 pts / breakdown zerado.
- **CB-LB-3** — Singleton inexistente em stats → bases vêm de `getCurrent()` (rows vazias) e contagens diretas no Mongo.

## 7. Dependências

- [scoring](./scoring.spec.md), [bet](./bet.spec.md), [match](./match.spec.md), [user](./user.spec.md), [sync](./sync.spec.md) (gatilho de rebuild).
