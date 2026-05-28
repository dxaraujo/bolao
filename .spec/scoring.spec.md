# Especificação — Pontuação (`scoring`)

- **ID:** SPEC-SCORING
- **Shared:** `shared/src/scoring.ts` — `calculateBetScore`, `compareLeaderboardRows`, `SCORING_RULES`, tipos `Score`, `BetScoreResult`, `LeaderboardRow`, `LeaderboardBreakdown`
- **Visão geral:** [`README.md`](./README.md) (princípio norteador)

## 1. Objetivo

Definir a **única** fonte de verdade para pontos: uma função pura usada de forma idêntica por backend (leaderboard/stats) e frontend (preview). Sem override em runtime.

## 2. Tabela de pontuação — `SCORING_RULES`

| Situação | Flag | Pontos |
|---|---|---|
| Placar exato | `exactScore` | **5** |
| Vencedor correto + um dos gols coincide | `winnerWithGoal` | **3** |
| Apenas vencedor correto | `correctWinner` | **2** |
| Errou o vencedor, mas acertou um dos gols | `oneGoalCorrect` | **1** |
| Errou tudo | `wrong` | **0** |
| Palpite ou placar ausente/ inválido | — | **0** |

`VALID_POINTS = [0,1,2,3,5]`; tipo `PointsEarned`.

## 3. Contrato — `calculateBetScore(bet?, match?) → BetScoreResult`

```ts
BetScoreResult {
  exactScore, winnerWithGoal, correctWinner, oneGoalCorrect, wrong: boolean  // exatamente um true (ou todos false se ZERO)
  points: PointsEarned
}
```

## 4. Requisitos funcionais

- **RF-SCORING-1** — `bet` ou `match` ausente/`null`/não-inteiro/negativo → resultado `ZERO` (todas as flags `false`, `points: 0`).
- **RF-SCORING-2** — `bet.home === match.home && bet.away === match.away` → `exactScore`, 5 pts.
- **RF-SCORING-3** — Senão, compara vencedor (`H/A/D`) dos dois placares e se algum gol coincide (`bet.home===match.home || bet.away===match.away`):
  - vencedor igual + um gol → `winnerWithGoal` (3); vencedor igual sem gol → `correctWinner` (2);
  - vencedor diferente + um gol → `oneGoalCorrect` (1); vencedor diferente sem gol → `wrong` (0).

## 5. Regras de negócio

- **RN-SCORING-1** — Função **pura e determinística**: sem I/O, sem estado, sem aleatoriedade. Mesmos inputs ⇒ mesmo output.
- **RN-SCORING-2** — Validade de `Score`: `home`/`away` inteiros `>= 0` (cap de input em `MAX_GOALS = 20` é aplicado na fronteira pelo DTO, não aqui).
- **RN-SCORING-3** — Backend e frontend importam de `@bolao/shared`; **proibido** duplicar a lógica de pontos.
- **RN-SCORING-4** — `compareLeaderboardRows` define o desempate em ordem: `points → exactScore → winnerWithGoal → correctWinner → oneGoalCorrect` (mais é melhor). Empate total após isso → considerado igual (mesmo rank).

## 6. Casos de borda

- **CB-SCORING-1** — Empate previsto e empate real com gols diferentes (ex. palpite 1×1, real 2×2): vencedor `D=D` → sem gol coincidente → `correctWinner` (2).
- **CB-SCORING-2** — Palpite 2×1, real 2×3: vencedor difere (`H≠A`), `home` coincide (2) → `oneGoalCorrect` (1).
- **CB-SCORING-3** — Placar parcial (LIVE) é tratado igual a final — **LIVE pontua** (ver [leaderboard](./leaderboard.spec.md)).

## 7. Dependências

- Consumida por [leaderboard](./leaderboard.spec.md), [bet](./bet.spec.md) e pelo frontend (`lib/scoring`).
