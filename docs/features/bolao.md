# Bolão — apostas do grupo (BolaoScreen)

Visualização de **todos os palpites de todos os usuários ativos** para as partidas das fases já encerradas (`BLOCKED`).

- **Rota:** `/bolao`
- **Componente:** `frontend/src/features/bolao/BolaoScreen.tsx`
- **Subcomponentes:** `MatchAccordion`, `BetRow`

## Por que só fases `BLOCKED`?

Para preservar o suspense — enquanto a fase está `OPEN`, ninguém vê os palpites dos outros. A partir do momento em que a fase é bloqueada (manual ou por `deadline`), todos podem ver tudo.

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
- Filtra as fases para apenas as `BLOCKED`
- Se não houver nenhuma `BLOCKED`, mostra `EmptyState`: *"Nenhuma fase encerrada — As apostas do grupo aparecem aqui após cada fase ser bloqueada."*

### Tabs por fase

- Mostram **apenas** fases `BLOCKED`
- Cada aba traz um **contador** com a quantidade de partidas nessa fase (`groups.filter(g => g.stage === s.matchStage).length`)
- Aba ativa default é a primeira da lista; pode ser trocada (estado local)

### Lista de partidas

Para a fase ativa:
- Se houver partidas com `group` (fase de grupos), agrupa por `group` com cabeçalhos (`Grupo A`, `Grupo B`, …)
- Ordena por `utcDate` ascendente
- Cada item é um `MatchAccordion` que abre/fecha para revelar a lista de palpites

### MatchAccordion

`frontend/src/features/bolao/components/MatchAccordion.tsx` — cabeçalho com escudos, TLA, placar real e indicadores agregados (quantidade de placares exatos, vencedor+gol, etc., vindo de `GroupedBet`). Ao expandir, lista cada usuário em um `BetRow`.

### BetRow

`frontend/src/features/bolao/components/BetRow.tsx` — uma linha por usuário com:
- Avatar (com fallback de iniciais)
- Nome
- Placar previsto
- Badge do resultado: **Exato**, **Vencedor + gol**, **Acertou um gol**, **Vencedor**, **Errou**, **—** (pendente)

O usuário autenticado (`me?._id`) é destacado visualmente nas linhas onde aparece.

## Dados consumidos

| Hook         | Endpoint                  | Uso                                |
|--------------|---------------------------|------------------------------------|
| `useStages`  | `GET /api/stage/visible`  | Tabs (filtradas por `BLOCKED`)     |
| `useAllBets` | `GET /api/bet/all`        | Agregado de palpites por partida   |
| `useMe`      | `GET /api/user/me`        | Destacar o usuário atual           |

## Como o backend monta o agregado

`BetService.listAll` (`backend/src/bet/bet.service.ts`):

1. Acha todas as fases com status `BLOCKED`. Se não houver, retorna `[]`.
2. Acha todos os `match._id` válidos dessas fases.
3. Acha todos os `user._id` ativos.
4. Lê todos os palpites desses pares (`{ match: { $in }, user: { $in } }`), populando `match` (com `homeTeam`/`awayTeam`) e `user`.
5. Reduz num mapa `matchId → GroupedBet`:
   - Cada chave acumula contadores `exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`, `total`
   - `bets[]` é populado com `{ user, homeTeamScore, awayTeamScore, flags, totalPointsEarned }`
6. Ordena `bets[]` por `user.name` (`pt-BR`) e a lista final por `utcDate`.

Resposta: `GroupedBet[]` (em `@bolao/shared/dto.ts`).

## Estados

- **Carregando:** três `Skeleton` enquanto `stagesLoading || groupsLoading`.
- **Sem fases encerradas:** `EmptyState` com ícone Search e mensagem específica.
- **Fase ativa sem partidas:** sub-EmptyState *"Nenhuma partida encerrada nesta fase"*. Cenário raro (fase BLOCKED quase sempre terá partidas) mas previsto.

## Casos de borda

- A lista mostra **apenas usuários ativos**. Se um usuário foi desativado depois da fase, seus palpites são apagados (`removeBetsForUser`) e ele desaparece daqui.
- Partidas `valid: false` não entram em `findMatchIdsByStages` e portanto não aparecem nem no agregado.
- Se uma fase tem partidas mas nenhum palpite registrado ainda (caso extremo), `Object.values(groupedBets)` retorna vazio para a fase, caindo em `EmptyState`.
