# Tela Início (HomeScreen)

Dashboard de chegada do usuário autenticado.

- **Rota:** `/`
- **Componente:** `frontend/src/features/home/HomeScreen.tsx`
- **Subcomponentes:** `HeroPosition`, `OpenStageBanner`, `MatchCard`, `UpcomingMatchCard`

## Comportamento

A tela é dividida em até quatro blocos verticais, renderizados condicionalmente conforme o estado das partidas e fases:

### 1. HeroPosition (sempre visível)

`frontend/src/features/home/components/HeroPosition.tsx` — destaca a posição do usuário no ranking. Usa o hook `useMe` para obter o documento `User` com `ranking` e `totalPointsEarned`.

### 2. OpenStageBanner (condicional)

`frontend/src/features/home/components/OpenStageBanner.tsx` — destaca a próxima fase aberta com prazo se aplicável. A cor de fundo muda conforme a urgência do `deadline` (vide commits recentes "alterar cor do OpenStageBanner conforme urgência do deadline").

Aparece apenas quando há `stages` e `bets` carregados.

### 3. Ao vivo (condicional)

Mostra cards das partidas com `status ∈ {LIVE, IN_PLAY, PAUSED}`, ordenadas por `utcDate` ascendente.

Componente: `MatchCard` — exibe os escudos, placar parcial e o palpite do usuário.

### 4. Próximos jogos (sempre visível com fallback)

Cards de partidas futuras (`status ∈ {TIMED, SCHEDULED}`), filtradas por uma **janela temporal dinâmica**:

```ts
firstBetDay = data do primeiro jogo futuro do usuário
todayStart  = início do dia atual (local)
windowStart = max(firstBetDay, todayStart)
windowEnd   = windowStart + 2 dias
```

Ou seja: mostra apenas jogos do **primeiro dia com partida pela frente** + **o dia seguinte**. Se não houver futuros, mostra `EmptyState` com o ícone Goal e a mensagem "Nenhum jogo futuro agendado".

Componente: `UpcomingMatchCard`.

### 5. Resultados recentes (condicional)

Até 4 partidas mais recentes com `status === FINISHED`, ordenadas por `utcDate` descendente. Usa `MatchCard` novamente.

## Dados consumidos

| Hook         | Endpoint          | Uso                                  |
|--------------|-------------------|--------------------------------------|
| `useMyBets`  | `GET /api/bet`    | Lista de palpites + dados da partida |
| `useStages`  | `GET /api/stage`  | Lista de fases (filtra `LOCKED` no client) |

Tipos consumidos de `@bolao/shared`:
- `BetListItem` (com `homeTeam`, `awayTeam`, `matchHomeTeamScore`, `matchAwayTeamScore`, `homeTeamScore`, `awayTeamScore`, `status`, `utcDate`, `stage`, `group`)
- `MatchStatus` para classificar ao vivo / futuro / encerrado

## Estados

- **Carregando:** `Skeleton` no bloco "Próximos jogos" enquanto `betsLoading` for `true`. Demais blocos renderizam vazios.
- **Sem palpites:** `bets` vazio → `live`, `upcoming` e `recent` ficam vazios. `EmptyState` no bloco "Próximos jogos".
- **Sem fase aberta:** `OpenStageBanner` não é exibido (só renderiza quando `stages && bets` estão presentes).

## Casos de borda

- A janela de "próximos jogos" pode resultar em **zero** itens mesmo havendo futuros (ex.: próxima partida só na semana que vem) — nesse caso, mostra `EmptyState`.
- "Ao vivo" considera `PAUSED` como ao vivo (intervalos de jogo etc.).
- A ordenação por `utcDate` desempata sem precisar de outros critérios, mas o componente `MatchCard` confia no backend para retornar dados consistentes (escudos, TLA, etc.).
