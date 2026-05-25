# Bolão — apostas do grupo (BolaoScreen)

Visualização de **todos os palpites de todos os usuários ativos** para as partidas das fases já encerradas (`CLOSED`).

- **Rota:** `/bolao`
- **Componente:** `frontend/src/features/bolao/BolaoScreen.tsx`
- **Subcomponentes:** `MatchAccordion`, `BetRow`

## Por que só fases `CLOSED`?

Para preservar o suspense — enquanto a fase está `OPEN`, ninguém vê os palpites dos outros. A partir do momento em que o `deadline` é ultrapassado (estado derivado vira `CLOSED`), todos podem ver tudo.

## Comportamento

### Estrutura visual

```
┌──────────────────────────────────────────┐
│ APOSTAS ENCERRADAS                       │
│ Tabs: Grupos (48) | Oit. (16) | …        │ ← contadores de jogos por fase
├──────────────────────────────────────────┤
│ [Grupo A]                                │ ← agrupador na fase de grupos
│   ┌────────────────────────────────────┐ │
│   │ BRA 2 x 0 SUI            [accordion]│ │ ← MatchAccordion
│   │   ╳ Daniel    2 × 0      Exato  +5 │ │
│   │   • Maria     1 × 0      Acertou+1│ │ ← BetRow por usuário
│   │   ✓ Pedro     2 × 1      Errou    │ │
│   └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### Estado inicial

- Carrega `useStages()` e `useAllBets()` (`GET /api/bet/all`) em paralelo
- Filtra as fases pelo `state === CLOSED` (state derivado por `getStageState`)
- Se não houver nenhuma `CLOSED`, mostra `EmptyState`: *"Nenhuma fase encerrada — As apostas do grupo aparecem aqui após cada fase ser encerrada."*

### Tabs por fase

- Mostram **apenas** fases `CLOSED`
- Cada aba traz um **contador** com a quantidade de partidas nessa fase
- Aba ativa default é a primeira da lista; pode ser trocada (estado local)

### Lista de partidas

Para a fase ativa:
- Se houver partidas com `group` (fase de grupos), agrupa por `group` com cabeçalhos (`Grupo A`, `Grupo B`, …)
- Ordena por `utcDate` ascendente
- Cada item é um `MatchAccordion` que abre/fecha para revelar a lista de palpites

### MatchAccordion

`frontend/src/features/bolao/components/MatchAccordion.tsx` — cabeçalho com escudos, TLA, placar real e badges com ícones lucide por categoria de acerto (Trophy/Goal/Target/CircleDot/X), vindo dos `totals` de `GroupedBetMatch`. Ao expandir, lista cada usuário em um `BetRow`.

### BetRow

`frontend/src/features/bolao/components/BetRow.tsx` — uma linha por usuário com:
- Avatar (com fallback de iniciais)
- Nome (badge "Você" se for o usuário autenticado)
- Placar previsto (colorido pelo tom do resultado)
- Badge do resultado com ícone: **Exato** (Trophy), **Vencedor + gol** (Goal), **Vencedor** (Target), **Acertou um gol** (CircleDot), **Errou** (X), **—** (pendente)
- Pontos ganhos

O usuário autenticado (`me?._id`) recebe destaque visual (`bg-acc/[0.06]`).

## Dados consumidos

| Hook         | Endpoint                  | Uso                                |
|--------------|---------------------------|------------------------------------|
| `useStages`  | `GET /api/stage`          | Tabs (filtradas por `state === CLOSED`) |
| `useAllBets` | `GET /api/bet/all`        | Agregado de palpites por partida   |
| `useMe`      | `GET /api/user/me`        | Destacar o usuário atual           |

## Como o backend monta o agregado

`BetService.listGrouped` (`backend/src/bet/bet.service.ts`):

1. Acha todas as fases cujo `getStageState` retorna `CLOSED`. Se não houver, retorna `[]`.
2. Acha todos os matches dessas fases (populando `homeTeam`, `awayTeam`, `stage`).
3. Acha todos os usuários ativos (`isActive: true`).
4. Lê todos os bets `{ match: { $in }, user: { $in } }`.
5. Para cada match, monta `GroupedBetMatch`:
   - `match`: `MatchPayload` com `score?: {home, away}`
   - `totals`: contadores por categoria (`exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`, `notBet`, `total`)
   - `participants`: `GroupedBetParticipant[]` — um por usuário ativo, com seu `score`/`result` ou ausente se não palpitou.
6. Retorna ordenado por `utcDate, footballDataId`.

Resposta: `GroupedBetMatch[]` (em `@bolao/shared/dto.ts`).

## Reatividade

Quando a cron `MatchSyncTask` rebuilda o leaderboard, atualiza `systemState.leaderboardRebuildAt`. Frontend (`useWatchResults`) detecta a mudança e invalida `['bets']` (cascata para `['bets', 'all']`) — o agregado é refetchado e a tela atualiza.

## Estados

- **Carregando:** três `Skeleton` enquanto `stagesLoading || groupsLoading`.
- **Sem fases encerradas:** `EmptyState` com ícone Search e mensagem específica.
- **Fase ativa sem partidas:** sub-EmptyState *"Nenhuma partida encerrada nesta fase"*.

## Casos de borda

- A lista mostra **apenas usuários ativos**. Espectadores não aparecem nem palpitam.
- Bets esparsos: usuários que não palpitaram aparecem com `score: undefined` e `result: undefined` (rotulados como **—** / "Não palpitou").
- `notBet` em `totals` conta esses usuários ausentes — útil para o cabeçalho do accordion.
