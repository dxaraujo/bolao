# Domínio (v2)

Conceitos, entidades e regras de negócio do Bolão da Copa 2026.

## Glossário

| Termo (PT-BR) | Identificador técnico | Significado |
|---|---|---|
| Usuário | `User` | Pessoa autenticada via Google |
| Participante | `User.isActive: true` | Usuário pagante. Apenas participantes palpitam e entram no ranking |
| Espectador | `User.isActive: false` | Usuário que vê tudo mas não palpita nem aparece no leaderboard |
| Seleção | `Team` | Time da Copa do Mundo |
| Partida | `Match` | Jogo individual entre duas seleções |
| Fase | `Stage` | Etapa da competição (grupos, oitavas, …) |
| Palpite | `Bet` | Previsão de placar de um participante para uma partida |
| Leaderboard | `Leaderboard` | View materializada do ranking + breakdown por participante |
| Estado da fase | derivado | `LOCKED`/`OPEN`/`CLOSED` computado em tempo real |

## Princípio norteador

> **O palpite é a única coisa que o usuário cria; tudo o mais é derivável.**
> `Match`/`Stage`/`Team` vêm do provedor externo, `Bet` é input do usuário, e ranking + estatísticas + estado da fase são views materializadas a partir desses três.

## Entidades

### `User`

`backend/src/user/schemas/user.schema.ts`

| Campo | Tipo | Descrição |
|---|---|---|
| `googleSub` | string unique | ID Google (`sub`) |
| `name`, `email` | string | Vindos do Google |
| `givenName` | string? | Primeiro nome do Google (`given_name`). Usado em UIs compactas (Pódio etc) |
| `picture` | string? | URL original do avatar Google (pré-download) |
| `avatar` | string? | Path local `/static/users/<id>.<ext>` (download via `MediaService`) |
| `isAdmin` | boolean | Acesso ao painel admin |
| `isActive` | boolean | **Participante pagante** (gate de palpite e leaderboard) |
| `participationChangedAt` | Date? | Última transição de `isActive` |
| `createdAt`, `updatedAt` | Date | Mongoose timestamps |

> Usuários novos começam com `isActive: false` (espectador). Admin ativa via `PATCH /api/user/:id`.

### `Team`

| Campo | Descrição |
|---|---|
| `footballDataId` | ID externo (único) |
| `name`, `shortName`, `tla` | Identificação |
| `flagEmoji` | **Preferencial** — emoji de bandeira (🇧🇷, 🇦🇷, …) derivado do TLA |
| `crest` | Fallback — URL `/static/teams/<TLA>.png` quando não há emoji |
| `externalLastUpdated` | Última atualização do provedor |

### `Stage`

| Campo | Descrição |
|---|---|
| `code` | `MatchStage` enum, único |
| `order` | 1..7 |
| `deadline` | Data de encerramento das apostas (mutável por admin via `PATCH /api/stage/:code`) |
| `expectedMatchCount` | Quantidade esperada de partidas — **fixo** via enum `STAGE_EXPECTED_MATCHES` (não editável) |

`StagePayload` (resposta API) inclui dois contadores derivados, calculados via aggregate no Mongo:

| Campo | Descrição |
|---|---|
| `importedMatchCount` | Total de matches importados nessa fase |
| `finishedMatchCount` | Total de matches com `status: FINISHED` na fase (usado pra progress bar) |

**Estado derivado** por `getStageState(stage, allStages, now)`:

```
LOCKED  → now < prev.deadline                    (anterior aberta ou prev=null)
OPEN    → now >= prev.deadline AND now < deadline
CLOSED  → now >= deadline
```

Exceção: `FINAL` referencia `SEMI_FINALS` como predecessora. `THIRD_PLACE` e `FINAL` podem coexistir em `OPEN`.

### `Match`

| Campo | Tipo | Descrição |
|---|---|---|
| `footballDataId` | number unique | ID externo |
| `utcDate` | Date | Data/hora UTC |
| `status` | `MatchStatus` | `SCHEDULED \| LIVE \| FINISHED \| CANCELLED` |
| `stage` | ObjectId → Stage | **FK real** (não string) |
| `group` | string? | Apenas para `GROUP_STAGE` (ex.: `GROUP_A`) |
| `homeTeam`, `awayTeam` | ObjectId → Team | **Obrigatórios** (TBD não é importada) |
| `score` | `{ home, away }?` | Subdocumento; só populado em LIVE/FINISHED |
| `externalLastUpdated` | Date | Última atualização do provedor |

`MatchStatus` interno tem 4 valores. O importador faz de-para via `mapExternalStatus`:

```
TIMED, SCHEDULED, POSTPONED  → SCHEDULED
IN_PLAY, PAUSED              → LIVE
FINISHED, AWARDED            → FINISHED
CANCELLED, SUSPENDED         → CANCELLED
```

Transições não-canônicas (ex.: `FINISHED → LIVE`) geram **warning** no log mas são aceitas — provedor é fonte de verdade.

### `Bet`

| Campo | Tipo | Descrição |
|---|---|---|
| `user` | ObjectId → User | Apostador |
| `match` | ObjectId → Match | Partida |
| `score` | `{ home, away }` | **Sempre presente** (ambos preenchidos, integers `0..20`) |
| `createdAt`, `updatedAt` | Date | timestamps |

**Sparse**: só existe quando o usuário palpitou. Index único `{user, match}`. Não há mais flags (`exactScore`, `winnerWithGoal`, …) nem `totalPointsEarned` — tudo derivado por `calculateBetScore`.

### `Leaderboard` (singleton)

View materializada recomputada quando há mudança de placar (ou ativação/desativação de usuário).

```ts
{
  key: 'singleton',
  generatedAt: Date,
  rows: [{
    user, points,
    breakdown: { exactScore, winnerWithGoal, correctWinner, oneGoalCorrect, wrong },
    rank
  }]
}
```

Somente participantes ativos entram. Critério de desempate: `points → exactScore → winnerWithGoal → correctWinner → oneGoalCorrect`.

### `SystemState` (singleton)

Timestamps de sincronização (sem boolean de progresso — derivado):

```ts
{
  key: 'singleton',
  scoreSyncStartedAt: Date | null,
  scoreSyncCompletedAt: Date | null,
  leaderboardRebuildAt: Date | null,
  lastMatchImportAt: Date | null
}
```

`scoringInProgress = scoreSyncStartedAt && (!scoreSyncCompletedAt || scoreSyncStartedAt > scoreSyncCompletedAt)`.

## Regras de pontuação

Função pura `calculateBetScore(bet.score, match.score)` em [`shared/src/scoring.ts`](../shared/src/scoring.ts):

| Situação | Flag | Pontos |
|---|---|---|
| Placar exato | `exactScore` | **5** |
| Vencedor + um gol coincide | `winnerWithGoal` | **3** |
| Apenas vencedor | `correctWinner` | **2** |
| Errou vencedor, acertou um gol | `oneGoalCorrect` | **1** |
| Errou totalmente | `wrong` | **0** |
| Palpite ausente ou placar ausente | nenhuma | **0** |

Constantes em `SCORING_RULES`. Frontend e backend importam da mesma fonte. **Não há override em runtime.**

**LIVE pontua.** Ranking atualiza em tempo real conforme placares parciais chegam.

## Fluxos principais

### 1. Login

1. Frontend obtém ID token do Google
2. `POST /auth/google { credential }`
3. Backend verifica, upserta `User` por `googleSub`, baixa avatar
4. Emite JWT `{ _id, name, email, avatar?, isAdmin, isActive }`

Novos usuários começam como espectadores.

### 2. Apostar

Apenas participantes ativos:

1. Frontend faz `PUT /api/bet { items: [...] }`
2. `BetService.submit` valida cada item:
   - Usuário existe e `isActive`
   - Partida existe com homeTeam/awayTeam resolvidos
   - `getStageState === 'OPEN'`
   - `match.status === 'SCHEDULED'`
   - Score `{home, away}` integers `0..20`
3. `bulkWrite` ordenado: score → upsert; null → delete
4. Falha em qualquer item → erro 400/403/404/409 (tudo-ou-nada)

### 3. Sincronização externa (cron + bootstrap)

`MatchSyncTask` é único responsável (`backend/src/schedule/match-sync.task.ts`):

- **`OnApplicationBootstrap`** na subida do backend: roda `teamService.importTeams()` + `runSync()`.
- **Cron `*/5 * * * *`** invoca `runSync()`.

`runSync()`:
1. `systemState.scoreSyncStarted()` — marca timestamp.
2. `matchService.importMatches()` — reimporta calendário+placares; TBDs são skipadas; transições não-canônicas geram warning.
3. `systemState.matchImported()`.
4. Se `changedIds.length > 0`: `leaderboardService.rebuild()` + `systemState.leaderboardRebuilt()`.
5. `finally`: `systemState.scoreSyncCompleted()`.

Frontend (`useWatchResults`) consulta `leaderboardRebuildAt` a cada 30s; quando muda, invalida `['bets', 'leaderboard', 'matches', 'stages']`.

### 5. Mudança de estado da fase

**Não há "abrir/fechar manual"** — estado é derivado em todo request. Admin pode ajustar `deadline` via `PATCH /api/stage/:code { deadline }`.

### 6. Ativar/desativar usuário

`PATCH /api/user/:id { isActive }`:
- Atualiza flag + `participationChangedAt`
- **Nenhum side-effect em Bet** — bets antigos permanecem
- Dispara `LeaderboardService.rebuild()` (entrada/saída do ranking)

## Espectadores

`isActive: false` = espectador.

| Recurso | Espectador | Participante |
|---|---|---|
| Ver home, ranking, bolão, stats | ✓ | ✓ |
| Acessar `/apostas` | ✗ (redireciona) | ✓ |
| Aparecer no leaderboard | ✗ | ✓ |
| Aparecer no cross-table do bolão | ✗ | ✓ |

Header mostra badge **"Espectador"**. BottomNav esconde a aba "Apostas". Reativação reincorpora histórico de palpites no ranking.
