# Estatísticas

Visão analítica do desempenho do bolão.

- **Rota:** `/stats`
- **Componente:** `frontend/src/features/stats/StatsScreen.tsx`
- **Subcomponentes:** `KpiGrid`, `AccuracyByUser`, `DistributionDonut`

## Comportamento

### Estrutura visual

```
┌────────────────────────────────────────┐
│ KPI GRID                               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │  48  │ │  12  │ │  85  │ │ Líder│   │
│  │partid│ │exatos│ │certos│ │ Maria│   │
│  └──────┘ └──────┘ └──────┘ └──────┘   │
├────────────────────────────────────────┤
│ ACCURACY BY USER       DISTRIBUTION    │
│ Daniel ████████ 25%   ┌──────┐         │
│ Maria  ███████░ 22%   │ 25% │         │
│ Pedro  ██░░░░░░ 8%    │exato│         │
│ ...                   └──────┘         │
└────────────────────────────────────────┘
```

### KPI Grid

`frontend/src/features/stats/components/KpiGrid.tsx` — quatro indicadores principais a partir de `StatsOverview`:

- **Total de partidas** — `totalMatches` (partidas com `status === FINISHED`)
- **Placares exatos** — `totalExactBets` (somatório de palpites com `exactScore: true`)
- **Total de acertos** — `totalCorrectBets` (palpites com pelo menos `winnerWithGoal`, `oneGoalCorrect` ou `correctWinner`)
- **Líder atual** — usuário ativo com mais `totalPointsEarned`, desempate por nome (asc)

### Accuracy By User

`frontend/src/features/stats/components/AccuracyByUser.tsx` — ranking por **percentual de placares exatos** sobre o total de palpites do usuário em partidas finalizadas:

```
accuracyPct = round(exactScore / totalBets * 100)
```

Ordenado por `accuracyPct` desc, com desempate por `name` (PT-BR).

> Note: este é um índice diferente do ranking geral — mede **acerto cirúrgico** (placar exato), não pontos. Um usuário que palpita muitos placares exatos sobe aqui mesmo errando em outras partidas.

### Distribution Donut

`frontend/src/features/stats/components/DistributionDonut.tsx` — gráfico donut (Recharts) com a distribuição dos resultados de **todos os palpites avaliados**:

- `exact` — exatos
- `winnerWithGoal` — vencedor + gol
- `correctWinner` — vencedor
- `oneGoalCorrect` — um gol
- `wrong` — erros

Cada fatia mostra `count` e `pct` (arredondado).

## Dados consumidos

| Hook                    | Endpoint                              | Uso                              |
|-------------------------|---------------------------------------|----------------------------------|
| `useStatsOverview`      | `GET /api/stats/overview`             | KPIs                             |
| `useStatsAccuracyByUser`| `GET /api/stats/accuracy-by-user`     | Ranking por acerto exato         |
| `useStatsDistribution`  | `GET /api/stats/distribution`         | Donut                            |

Tipos: `StatsOverview`, `UserAccuracy[]`, `Distribution` em `@bolao/shared`.

## Como o backend calcula

`StatsService` (`backend/src/stats/stats.service.ts`):

### `overview()`

`Promise.all` de 4 contagens:

```ts
matchModel.countDocuments({ status: FINISHED })
betModel.countDocuments({ exactScore: true })
betModel.countDocuments({ $or: [{ winnerWithGoal: true }, { oneGoalCorrect: true }, { correctWinner: true }] })
userModel.findOne({ isActive: true }).sort({ totalPointsEarned: -1, name: 1 })
```

### `accuracyByUser()`

1. Filtra para usuários ativos e partidas com `status === FINISHED`
2. Se algum dos conjuntos for vazio → retorna todos os ativos com valores zerados
3. Faz `aggregate $group` por usuário sobre os bets daqueles matches:
   - Soma cada flag booleana como `1`/`0`
   - Conta `totalBets`
4. Mapeia de volta para os usuários ativos (usuários ativos sem nenhum palpite finalizado entram zerados)
5. `accuracyPct = totalBets === 0 ? 0 : round(exactScore / totalBets * 100)`
6. Ordena por `accuracyPct` desc + `name`

### `distribution()`

1. Mesmos filtros de ativos + finalizadas. Se algum for vazio → retorna tudo em zero.
2. `aggregate $group: null` somando cada flag e `total`
3. Calcula `pct = total === 0 ? 0 : round(n / total * 100)`

## Estados

- **Carregando:** `Skeleton` para cada bloco enquanto seus dados não chegam (cada hook é independente — partes podem aparecer antes de outras).
- **Sem partidas finalizadas:** o donut e o "Accuracy By User" mostram tudo em zero; KPIs também.
- **Sem usuários ativos:** "Accuracy By User" fica vazio; KPIs ainda podem ter `totalMatches > 0`.

## Casos de borda

- **`totalCorrectBets`** soma três flags exclusivas (apenas uma é `true` por palpite avaliado), então o número equivale ao total de palpites com qualquer acerto **menos** os exatos.
- **`accuracyPct === 0`** para usuários ativos sem nenhum palpite avaliado — eles ainda aparecem na lista, em zero (ordenados depois dos com acerto positivo).
- **`%` arredondado** — a soma das fatias do donut pode dar 99% ou 101% por arredondamento.
- Os contadores no documento `User` (`exactScore`, `winnerWithGoal`, etc.) são valores materializados pelo `ResultService` e **não** são usados em `StatsService` — este recalcula a partir dos `Bet`s, garantindo consistência mesmo se o ranking estiver dessincronizado.
