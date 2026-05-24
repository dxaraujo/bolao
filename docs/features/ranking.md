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

`frontend/src/features/ranking/components/ScoringTable.tsx` — exibe as regras configuradas em `Config`:

| Categoria              | Pontos                    |
|------------------------|---------------------------|
| Placar exato           | `config.pointsExactScore`     |
| Vencedor + gol         | `config.pointsWinnerWithGoal` |
| Acertou um gol         | `config.pointsOneGoalCorrect` |
| Apenas vencedor        | `config.pointsCorrectWinner`  |

> ⚠️ A `ScoringTable` lê os valores da `Config`, mas o motor de cálculo em `result.service.ts` usa valores **hardcoded** (5/3/2/1). Mudar `Config` no banco altera o que aparece na tabela mas **não** altera o cálculo. Ver [pontuacao.md](./pontuacao.md).

## Dados consumidos

| Hook         | Endpoint           | Uso                              |
|--------------|--------------------|----------------------------------|
| `useRanking` | `GET /api/ranking` | Lista de usuários classificados  |
| `useConfig`  | `GET /api/config`  | Pontos por categoria (tabela)    |
| `useMe`      | `GET /api/user/me` | Destacar o usuário atual         |

## Como o ranking é calculado

A leitura de `/api/ranking` é **só leitura** — `RankingService.find()` apenas faz `User.find({ isActive: true })` e ordena.

O cálculo real acontece em `ResultService.updateResults` (`backend/src/match/result.service.ts`), executado:
- A cada execução bem-sucedida da cron `UpdateScoresTask` (se houve mudança de placar)
- Após `POST /api/match/update-scores` (acionamento manual via Admin)

Algoritmo do ranking:

```
1. activeUsers = User.find({ isActive: true }).sort({ name: 1 })
2. agg = Bet.aggregate por user → { totalPointsEarned, exactScore, winnerWithGoal, correctWinner, oneGoalCorrect, wrong }
3. rows = mapeia cada user com seus totais (zerado se não há bets)
4. rows.sort(compareRows)
5. atribui ranking sequencial:
   - se rows[i] empata com rows[i-1] em todos os critérios → mesmo ranking, tiedCount++
   - senão → currentRank += tiedCount, tiedCount = 1
6. bulkWrite atualiza cada User com seus totais + ranking
```

`compareRows`:
```
b.totalPointsEarned - a.totalPointsEarned
|| b.exactScore - a.exactScore
|| b.winnerWithGoal - a.winnerWithGoal
|| b.correctWinner - a.correctWinner
|| b.oneGoalCorrect - a.oneGoalCorrect
```

Detalhes completos em [pontuacao.md](./pontuacao.md).

## Estados

- **Carregando:** três `Skeleton` enquanto `isLoading || !ranking`.
- **Sem usuários ativos:** lista vazia; o pódio renderiza zero elementos (visualmente, vazio).

## Casos de borda

- **Usuários inativos não aparecem** mesmo se tiverem palpites antigos no banco.
- **Empates triplos no topo:** três usuários com a mesma pontuação no critério principal e em todos os desempates recebem `ranking: 1` cada. O próximo recebe `ranking: 4`.
- A ordenação retornada pela API usa `ranking` desc + `name` asc (pt-BR locale). Isso difere ligeiramente da ordenação aplicada por `compareRows` no momento da escrita — não há divergência prática porque o `ranking` já reflete o critério de desempate.
