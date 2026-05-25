# Ranking

Classificação geral dos usuários ativos do bolão.

- **Rota:** `/ranking`
- **Componente:** `frontend/src/features/ranking/RankingScreen.tsx`
- **Subcomponentes:** `Podium`, `RankingList`, `PointsChart`, `ScoringTable`

## Comportamento

### Estrutura visual

Layout responsivo. Em desktop, duas colunas; em mobile, empilhado:

```
┌────────────────────────────────────────────┐
│         🥈        🥇        🥉             │ ← Podium (top 3)
│       Maria     Daniel     Pedro           │
│        38         42         31            │
├────────────────────────────────────────────┤
│ CLASSIFICAÇÃO COMPLETA                     │
│ #1  Daniel ── 42 pts ── 3 exatos · 5 …     │
│ #2  Maria  ── 38 pts ── 2 exatos · 4 …     │
│ #3  Pedro  ── 31 pts ── 1 exato  · 6 …     │
│ ...                                        │
├────────────────────────────────────────────┤
│ POINTS CHART (gráfico)  │  SCORING TABLE   │
│  (barras por usuário)   │  (tabela regras) │
└────────────────────────────────────────────┘
```

### Pódio

`frontend/src/features/ranking/components/Podium.tsx` — recebe `ranking.slice(0, 3)`. Renderiza os top 3 com destaques visuais (ouro, prata, bronze) e a foto/iniciais de cada usuário.

> Note: o slice é por **posição na lista** retornada pela API, que já vem ordenada pelo backend. A API ordena por `ranking` decrescente e, em empate, `name` ascendente. Empates causam **mesmo número de `ranking`** (não posições consecutivas — o próximo posto pula).

### Lista completa

`frontend/src/features/ranking/components/RankingList.tsx` — todos os usuários ativos. O usuário atual (`me?._id`) é destacado.

### Gráfico de pontos

`frontend/src/features/ranking/components/PointsChart.tsx` — gráfico Recharts (provavelmente bar chart) com `totalPointsEarned` por usuário. O usuário atual recebe cor de destaque.

### Tabela de pontuação

`frontend/src/features/ranking/components/ScoringTable.tsx` — exibe as regras de pontuação (constantes em `@bolao/shared`):

| Categoria              | Pontos                    |
|------------------------|---------------------------|
| Placar exato           | `SCORING_RULES.exactScore` (5)     |
| Vencedor + gol         | `SCORING_RULES.winnerWithGoal` (3) |
| Acertou um gol         | `SCORING_RULES.oneGoalCorrect` (1) |
| Apenas vencedor        | `SCORING_RULES.correctWinner` (2)  |

A `ScoringTable` lê constantes do `@bolao/shared` (`SCORING_RULES`) — a mesma fonte usada pelo backend em `calculateBetScore`. Não há mais coleção `Config`.

## Dados consumidos

| Hook            | Endpoint                 | Uso                              |
|-----------------|--------------------------|----------------------------------|
| `useLeaderboard`| `GET /api/leaderboard`   | Lista de usuários classificados  |
| `useMe`         | `GET /api/user/me`       | Destacar o usuário atual         |

## Como o ranking é calculado

`GET /api/leaderboard` lê o **singleton** persistido em `Leaderboard` (recomputado por `LeaderboardService.rebuild()`).

O rebuild acontece:
- Pela cron unificada `MatchSyncTask` (quando há mudanças de placar — `changedIds.length > 0`)
- Manualmente via `POST /api/leaderboard/rebuild` no Admin
- Quando um usuário muda `isActive` (entrada/saída do ranking) — em `UserService.update`

Algoritmo (`LeaderboardService.rebuild`):

```
1. activeUsers = User.find({ isActive: true }).sort({ name: 1 })
2. scoredMatches = Match.find({ status: { $in: [LIVE, FINISHED] }, score: { $exists: true } })
3. bets = Bet.find({ user: { $in }, match: { $in } })
4. agg por user: percorre cada bet, chama calculateBetScore(bet.score, match.score),
   acumula points + breakdown (exactScore, winnerWithGoal, correctWinner, oneGoalCorrect, wrong) + totalBets
5. sort por compareLeaderboardRows
6. assigna rank de competição (empates compartilham rank, próximo distinto pula)
7. persist no singleton via upsert
```

`compareLeaderboardRows` (em `@bolao/shared`):
```
b.points - a.points
|| b.breakdown.exactScore - a.breakdown.exactScore
|| b.breakdown.winnerWithGoal - a.breakdown.winnerWithGoal
|| b.breakdown.correctWinner - a.breakdown.correctWinner
|| b.breakdown.oneGoalCorrect - a.breakdown.oneGoalCorrect
```

Detalhes completos em [pontuacao.md](./pontuacao.md).

## Estados

- **Carregando:** três `Skeleton` enquanto `isLoading || !ranking`.
- **Sem usuários ativos:** lista vazia; o pódio renderiza zero elementos (visualmente, vazio).

## Casos de borda

- **Usuários inativos não aparecem** mesmo se tiverem palpites antigos no banco.
- **Empates triplos no topo:** três usuários com a mesma pontuação no critério principal e em todos os desempates recebem `ranking: 1` cada. O próximo recebe `ranking: 4`.
- A ordenação retornada pela API usa `ranking` desc + `name` asc (pt-BR locale). Isso difere ligeiramente da ordenação aplicada por `compareRows` no momento da escrita — não há divergência prática porque o `ranking` já reflete o critério de desempate.
