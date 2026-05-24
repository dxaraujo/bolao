# Motor de pontuação (v2)

Lógica de cálculo de pontos por palpite e materialização do leaderboard.

- **Função pura:** `calculateBetScore(bet.score, match.score)` em [`shared/src/scoring.ts`](../../shared/src/scoring.ts)
- **Constantes:** `SCORING_RULES` (mesma fonte para backend e frontend)
- **Orquestrador:** `LeaderboardService.rebuild()` em [`backend/src/leaderboard/leaderboard.service.ts`](../../backend/src/leaderboard/leaderboard.service.ts)
- **Gatilho automático:** `MatchSyncTask` (cron, a cada 5 min, 24/7) quando há mudanças
- **Gatilho manual:** `POST /api/leaderboard/rebuild` (admin) ou ao ativar/desativar usuário

## Regras

| Situação | Flag | Pontos |
|---|---|---|
| Placar exato | `exactScore` | **5** |
| Acertou vencedor + um gol | `winnerWithGoal` | **3** |
| Acertou apenas o vencedor (ou empate) | `correctWinner` | **2** |
| Errou vencedor, acertou um gol | `oneGoalCorrect` | **1** |
| Errou totalmente | `wrong` | **0** |
| Palpite ausente OU placar ausente | nenhuma | **0** |

`SCORING_RULES = { exactScore: 5, winnerWithGoal: 3, correctWinner: 2, oneGoalCorrect: 1, wrong: 0 }`.

**Sem divergência:** a constante é fonte única. Não há `Config` separado. Para mudar, edite `shared/src/scoring.ts` e faça release.

**LIVE pontua.** O leaderboard considera partidas `LIVE` e `FINISHED` com `score` presente. Ranking oscila em tempo real conforme placares parciais.

## `LeaderboardService.rebuild()`

Pipeline (síncrono, in-memory):

1. `User.find({ isActive: true })`
2. `Match.find({ status: { $in: ['LIVE', 'FINISHED'] }, score: { $exists: true } })`
3. `Bet.find({ user ∈ activeUsers, match ∈ scoredMatches })`
4. Para cada bet, `calculateBetScore(bet.score, match.score)` → acumula `points` + `breakdown`
5. Ordena com `compareLeaderboardRows`:
   ```
   points desc → exactScore desc → winnerWithGoal desc → correctWinner desc → oneGoalCorrect desc
   ```
6. Atribui `rank` com tratamento de empates (mesmo rank, pula posições: 1, 2, 2, 4…)
7. Persiste `Leaderboard` singleton + `SystemState.leaderboardRebuildAt`

Idempotente — rodar duas vezes com o mesmo input produz o mesmo resultado.

## Garantias

- **Determinístico:** dado o mesmo conjunto de `Bet`s e `Match`s, sempre produz o mesmo leaderboard
- **Sem materialização em `User`:** zero contadores ou ranking no documento — tudo na view
- **Sem materialização em `Bet`:** zero flags por palpite — score é derivado
- **Espectadores excluídos:** view só contém `isActive: true`; reativação reincorpora histórico
- **Atomic-ish:** `updateOne` no singleton com upsert

## Casos de borda

- **Zero usuários ativos:** leaderboard fica `{ generatedAt, rows: [] }`
- **Zero partidas com score:** todos os ativos ficam com 0 points, rank 1 (todos empatados)
- **Partida CANCELLED:** ignorada (não tem score válido)
- **Reativação de usuário:** dispara rebuild automaticamente; bets antigos voltam a contar
