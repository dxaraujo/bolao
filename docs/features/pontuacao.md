# Motor de pontuação

Lógica de cálculo de pontos por palpite e materialização do ranking.

- **Arquivo principal:** `backend/src/match/result.service.ts`
- **Função pura:** `calculateBetScore(bet, match)`
- **Orquestrador:** `ResultService.updateResults(changedMatchIds)`
- **Gatilho automático:** `UpdateScoresTask` (cron, a cada 5 min entre 7h e 20h)
- **Gatilho manual:** `POST /api/match/update-scores` (admin)

## Regras de pontuação

A função `calculateBetScore` recebe o palpite e o placar real e retorna **uma única** das 5 categorias:

| Situação                                                  | Flag             | Pontos |
|-----------------------------------------------------------|------------------|--------|
| Palpite igual ao placar real                              | `exactScore`     | **5**  |
| Acertou vencedor (ou empate) **e** um dos gols            | `winnerWithGoal` | **3**  |
| Acertou apenas o vencedor (ou empate)                     | `correctWinner`  | **2**  |
| Errou o vencedor mas acertou um dos gols                  | `oneGoalCorrect` | **1**  |
| Errou totalmente                                          | `wrong`          | **0**  |
| Palpite ou placar real ausente / inválido                 | nenhuma          | **0**  |

### Pseudocódigo

```
isValidScore(v): v é number, finito, >= 0
winner(a, b):    a > b → 'A' ; b > a → 'B' ; senão → 'E'

se palpite.home, palpite.away, match.home, match.away não são todos válidos
    → retorna ZERO_BET_SCORE (todas flags false, 0 pontos)

se palpite.home == match.home E palpite.away == match.away
    → exactScore = true, 5 pontos

betWinner   = winner(palpite.home, palpite.away)
matchWinner = winner(match.home, match.away)

se betWinner == matchWinner:
    scoredOneGoal = palpite.home == match.home  OU  palpite.away == match.away
    se scoredOneGoal → winnerWithGoal = true, 3 pontos
    senão           → correctWinner  = true, 2 pontos

senão (errou o vencedor):
    scoredOnlyOneGoal = palpite.home == match.home  OU  palpite.away == match.away
    se scoredOnlyOneGoal → oneGoalCorrect = true, 1 ponto
    senão                → wrong          = true, 0 pontos
```

### Exemplos

| Palpite | Real | Categoria         | Pontos |
|---------|------|-------------------|--------|
| 2 × 1   | 2 × 1| `exactScore`      | 5      |
| 2 × 0   | 2 × 1| `winnerWithGoal`  | 3      |
| 3 × 1   | 2 × 1| `winnerWithGoal`  | 3      |
| 2 × 1   | 3 × 2| `correctWinner`   | 2      |
| 1 × 1   | 0 × 0| `correctWinner`   | 2      |
| 0 × 2   | 2 × 1| `oneGoalCorrect`  | 1 *(errou o vencedor, acertou que o visitante fez 1? veja nota)* |
| 0 × 0   | 1 × 2| `wrong`           | 0      |
| —       | 1 × 0| `wrong` (flag) / 0 pts | 0 |

> Note sobre o caso `0 × 2 vs 2 × 1`: `palpite.away = 2` vs `match.away = 1` → não bate. `palpite.home = 0` vs `match.home = 2` → não bate. Logo, **errou totalmente** (`wrong = true, 0 pontos`). Exemplo mais claro de `oneGoalCorrect`: `0 × 1` vs `2 × 1` → vencedor errado (palpite empate/visitante; real é mandante), `palpite.away == match.away (1)` → `oneGoalCorrect = true`, 1 ponto.

## ⚠️ Divergência entre `Config` e o motor

A entidade `Config` (`backend/src/config/schemas/config.schema.ts`) armazena valores configuráveis para a tabela:

```ts
pointsExactScore:       5 (default)
pointsWinnerWithGoal:   3
pointsOneGoalCorrect:   2
pointsCorrectWinner:    1
```

Esses valores são **lidos pela UI** (frontend `ScoringTable`, `BetsScreen` cabeçalho) para exibir as regras.

Porém, `calculateBetScore` em `result.service.ts` usa números **hardcoded**:
```ts
return { ...ZERO_BET_SCORE, exactScore: true, totalPointsEarned: 5 }
// ...
return { ...ZERO_BET_SCORE, winnerWithGoal: true, totalPointsEarned: 3 }
// ...
return { ...ZERO_BET_SCORE, correctWinner: true, totalPointsEarned: 2 }
// ...
return { ...ZERO_BET_SCORE, oneGoalCorrect: true, totalPointsEarned: 1 }
```

> **Implicação:** alterar `Config` no banco muda o que a UI exibe, mas **não** muda o cálculo. Para manter consistência, mantenha `Config` igual aos valores hardcoded (`5/3/2/1`) ou pareie ambos os lugares antes de mudar.

A enumeração `VALID_POINTS = [0, 1, 2, 3, 5] as const` em `shared/src/enums.ts` reforça os 5 valores possíveis no nível de tipo (`PointsEarned`).

## Atualização de pontuação (`ResultService.updateResults`)

Chamado com a lista de `_id`s de partidas que tiveram **mudança** desde a última execução. Fluxo:

### 1. Recalcular cada palpite afetado

```
changedBets = Bet.find({ match: { $in: changedMatchIds } }).populate('match')
bulkWrite: para cada bet, $set ← calculateBetScore(bet, bet.match)
```

Idempotente: rodar duas vezes com o mesmo input produz exatamente o mesmo resultado.

### 2. Agregar contadores por usuário ativo

```
activeUsers = User.find({ isActive: true }).sort({ name: 1 })
if (activeUsers.length === 0)
    setLastUpdateResults(now); return

agg = Bet.aggregate por user → {
  totalPointsEarned, exactScore, winnerWithGoal,
  correctWinner, oneGoalCorrect, wrong
}
```

A agregação roda sobre **todos os palpites** dos usuários ativos (não apenas os afetados), garantindo coerência mesmo se algum palpite anterior tiver sido recalculado em outra rodada.

### 3. Calcular ranking com desempate

```
rows = activeUsers.map(u => ({ _id, totals: agg[u._id] ?? zero, ranking: 0 }))
rows.sort(compareRows)

currentRank = 1
tiedCount = 1
for i in [0..N-1]:
  if i > 0:
    se compareRows(rows[i], rows[i-1]) == 0:
      currentRank = rows[i-1].ranking
      tiedCount += 1
    senão:
      currentRank = currentRank + tiedCount
      tiedCount = 1
  rows[i].ranking = currentRank
```

`compareRows` (mesmo critério usado para ordenar):

```
b.totalPointsEarned - a.totalPointsEarned
|| b.exactScore - a.exactScore
|| b.winnerWithGoal - a.winnerWithGoal
|| b.correctWinner - a.correctWinner
|| b.oneGoalCorrect - a.oneGoalCorrect
```

> Note: `wrong` **não** entra no desempate. Empates totais (todos os critérios iguais) recebem o mesmo `ranking`.

### Exemplo de empate

Quatro usuários com:
- Daniel: 42 pts, 3 exatos, 4 vencedor+gol, 3 vencedor, 5 um gol
- Maria:  42 pts, 3 exatos, 4 vencedor+gol, 3 vencedor, 5 um gol
- Pedro:  42 pts, 3 exatos, 4 vencedor+gol, 3 vencedor, 4 um gol
- Ana:    38 pts, …

Resultado: Daniel=1, Maria=1, Pedro=3, Ana=4. (Daniel e Maria empatam completamente; Pedro perde no critério `oneGoalCorrect`.)

### 4. Persistir totais e ranking

```
bulkWrite: para cada row, $set ← { ...totais, ranking }
```

### 5. Marcar timestamp

```
Config.lastUpdateResults = new Date()
```

Consumido pelo frontend para mostrar "última atualização".

## Quando rodar

| Gatilho                                        | Onde                                                       |
|------------------------------------------------|------------------------------------------------------------|
| Cron `*/5 7-20 * * *`                          | `UpdateScoresTask` → `ScoreService.updateScores`            |
| Admin clica em **Atualizar Resultados**        | `POST /api/match/update-scores` → `ScoreService.updateScores` |

Em ambos os casos, `ScoreService` busca a Football Data API, identifica partidas com mudança e só então chama `ResultService.updateResults(changedMatchIds)`. Se nenhuma partida mudou, `updateResults` retorna imediatamente (`if (changedMatchIds.length === 0) return`).

## Garantias

- **Determinístico:** dado o mesmo conjunto de `Bet`s e `Match`s, sempre produz o mesmo ranking.
- **Idempotente:** chamadas repetidas com o mesmo input geram o mesmo output.
- **Atômico por usuário:** o `bulkWrite` atualiza cada documento isoladamente. Não há transação Mongo; em caso de falha parcial, alguns usuários podem ter totais atualizados e outros não — a próxima execução corrige (a agregação rebusca tudo).
- **Resiliente a desativação:** se um usuário foi desativado, ele não entra em `activeUsers` e não é tocado. Suas estatísticas no documento `User` ficam congeladas no último valor — mas ele também perdeu todos os palpites, então os totais agregados refletem zero. Para o ranking, ele simplesmente não aparece.

## Casos de borda

- **`changedMatchIds` com `_id`s de partidas inválidas:** a busca `Bet.find({ match: { $in } })` retorna vazio; a função apenas atualiza `lastUpdateResults` e termina.
- **Times com 0 usuários ativos:** `activeUsers.length === 0` → early return, `Config.lastUpdateResults` é atualizado mas nenhum ranking muda.
- **Re-importação retroativa:** se o `ScoreService` voltar a "ver" uma partida antiga com placar diferente (ex.: correção pelo provedor externo), a partida é atualizada e o `ResultService` recalcula tudo dali; o ranking se ajusta na rodada seguinte.
