# Apostas (BetsScreen)

Tela onde o usuário registra seus palpites para as partidas das fases abertas.

- **Rota:** `/apostas`
- **Componente:** `frontend/src/features/bets/BetsScreen.tsx`
- **Subcomponente:** `frontend/src/features/bets/components/BetCard.tsx`

## Comportamento

### Estrutura visual

```
┌──────────────────────────────────────────┐
│ Tabs: Grupos | Oit. | Quart. | Semi …    │ ← navegação entre fases
├──────────────────────────────────────────┤
│ Cabeçalho: status da fase + prazo        │
│   "Apostas abertas · Prazo: 11/06 12:00" │
├──────────────────────────────────────────┤
│ [Grupo A]                                │ ← agrupador, só na fase de grupos
│   BetCard (jogo 1)                       │
│   BetCard (jogo 2)                       │
│   BetCard (jogo 3)                       │
│ [Grupo B] …                              │
├──────────────────────────────────────────┤
│ ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌                       │ ← Progress bar (preenchidas / total)
│ [ SALVAR 6 APOSTAS ]                     │ ← sticky no rodapé, só se OPEN
└──────────────────────────────────────────┘
```

### Tabs por fase

- Construídas a partir de `useStages()` (`GET /api/stage/visible`)
- A aba ativa default é a primeira fase em `OPEN`; se nenhuma estiver aberta, a primeira da lista
- Fases `DISABLED` aparecem como abas **desabilitadas** (cinzas, sem clique)
- Fases `OPEN` recebem um indicador verde de bolinha
- Estado da aba é mantido em React state local; ao trocar de aba, o usuário não perde o que digitou (`draft` persiste no escopo da tela)

### Cabeçalho de status

Renderizado conforme `currentStage.status`:

| Status     | Aparência                                                          | Texto                                                                  |
|------------|--------------------------------------------------------------------|------------------------------------------------------------------------|
| `OPEN`     | Card verde com ícone `CalendarClock`                               | `Apostas abertas` + `Prazo: <deadline formatado>` (se houver deadline)<br>ou `+5 placar exato · +1 resultado` (resumo da regra) |
| `BLOCKED`  | Card neutro com ícone `Lock`                                       | `Fase encerrada` + `Veja seus resultados abaixo`                       |
| `DISABLED` | Card opaco                                                         | `Fase não disponível`                                                  |

### BetCard

`frontend/src/features/bets/components/BetCard.tsx` — uma linha por partida com:
- Escudo + TLA do mandante
- Dois inputs numéricos para `homeTeamScore` e `awayTeamScore`
- Escudo + TLA do visitante

Quando `disabled === true` (fase `BLOCKED` ou `DISABLED`), os inputs ficam read-only e o card exibe o placar real e o palpite gravado lado a lado, indicando o resultado (acertou / errou / pendente).

### Ordenação dos palpites

Dentro da fase ativa, a ordenação é:

1. `group` (string) — `'A' < 'B' < …`
2. `utcDate` ascendente
3. `homeTeam.tla` ascendente
4. `awayTeam.tla` ascendente

Na fase de grupos, palpites são adicionalmente **agrupados por `group`** com um rótulo (`Grupo A`, `Grupo B`, …). Em fases eliminatórias, sem agrupamento — todos os cards numa lista única.

### Progress bar e salvar

No rodapé sticky (apenas se `currentStage.status === OPEN` e há palpites na fase):

- Conta `filled = palpites do draft com ambos os campos preenchidos`
- `Progress` mostra `filled / stageBets.length`
- Botão **SALVAR N APOSTA(S)**:
  - Desabilitado se `filled === 0` ou se há mutação em curso
  - Ao clicar, envia `PUT /api/bet/updateBets { bets }` apenas com os palpites preenchidos
  - Toast de sucesso/erro via `sonner`
  - Erros mostrados como `toast.error(error.message)`

### Edição

- O `draft` é populado a partir de `bets` no primeiro render (efeito que copia `homeTeamScore`/`awayTeamScore` existentes para strings; usa string `''` para vazio)
- Editar um input atualiza o `draft` localmente; o backend só recebe na próxima chamada de "Salvar"
- Recargas do `bets` (após mutação ou refetch) não sobrescrevem o `draft` de palpites já presentes no estado local

## Dados consumidos

| Hook            | Endpoint                  | Uso                                    |
|-----------------|---------------------------|----------------------------------------|
| `useStages`     | `GET /api/stage/visible`  | Tabs                                   |
| `useMyBets`     | `GET /api/bet`            | Lista de palpites do usuário          |
| `useConfig`     | `GET /api/config`         | Pontos por categoria (na barra status) |
| `useUpdateBets` | `PUT /api/bet/updateBets` | Mutação de salvar                      |

## Garantias do backend

`BetService.updateBets` aplica `bulkWrite` com filtro composto:
```ts
filter: { _id: bet._id, user: userId, match: { $in: openMatchIds } }
```

Isso garante que:
- Um usuário não pode editar palpites de outro
- Mesmo se o frontend mandar palpites de fases já bloqueadas, eles são **silenciosamente ignorados** (sem erro 4xx)

## Casos de borda

- **Aba ativa sumiu:** se a aba selecionada não está mais na lista de stages (ex.: refetch reduziu visibilidade), cai no default (primeira `OPEN` ou primeira da lista).
- **Toast de plural:** `SALVAR 1 APOSTA` / `SALVAR 2 APOSTAS`. Confirmação usa `"X aposta salva"` ou `"X apostas salvos"` (note a inconsistência atual em `"X apostas salvos"` — ver `BetsScreen.tsx:114`).
- **Apostando sem fase aberta:** se nenhuma fase estiver `OPEN`, a aba ativa vai para alguma `BLOCKED` ou `DISABLED`, todos os inputs ficam desabilitados, e o rodapé sticky não aparece.
- **`draft` em memória:** se o usuário recarregar a página antes de salvar, perde o digitado.
