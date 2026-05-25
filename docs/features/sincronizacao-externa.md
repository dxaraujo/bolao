# Sincronização com Football Data API

Integração com a [Football Data API](https://www.football-data.org/) (`/competitions/WC/...?season=2026`) para importar times, partidas e placares.

- **Configuração:** env `FOOTBALL_DATA_API_URL`, `FOOTBALL_DATA_API_KEY`
- **Header de auth:** `X-Auth-Token: <key>`
- **Endpoints externos usados:**
  - `GET {API_URL}/competitions/WC/teams?season=2026`
  - `GET {API_URL}/competitions/WC/matches?season=2026`

Toda a sincronização é orquestrada por uma única cron (`MatchSyncTask`). A v2 não tem mais `ImportMatchesTask`, `UpdateScoresTask` nem `BlockStagesTask` separadas.

---

## 1. Importar times

- **Serviço:** `TeamService.importTeams` (`backend/src/team/team.service.ts`)
- **Endpoint admin:** `POST /api/team/import`
- **Trigger automático:** `MatchSyncTask.onApplicationBootstrap` (sobe junto com o backend).
- **Trigger manual:** botão "Importar Times" no Admin.

### Fluxo

1. `GET {API}/competitions/WC/teams?season=2026`
2. Para cada time externo:
   - Resolve `flagEmoji` via `tlaToFlagEmoji(tla)` (tabela alpha-3 → alpha-2 em `shared/src/flag-emoji.ts`).
   - Se `flagEmoji` existir, usa-o; senão baixa o escudo para `static/teams/<TLA>.png` em `crest` (fallback).
   - Upsert por `footballDataId`.

### Auto-correção no boot

`UserService.onModuleInit` → `syncMissingAvatars()` faz a mesma ideia para avatares de usuários (re-baixa se o arquivo sumiu do disco).

---

## 2. Importar partidas + placares (unificado)

- **Serviço:** `MatchService.importMatches` (`backend/src/match/match.service.ts`)
- **Endpoint admin:** `POST /api/match/import` — também rebuilda leaderboard quando há mudanças.
- **Trigger automático:** `MatchSyncTask` (bootstrap + cron `*/5 * * * *`).

### Fluxo

1. `GET {API}/competitions/WC/matches?season=2026`
2. Para cada `externalMatch`:
   - Skipa se a `stage` externa não está no enum local (`MatchStage`).
   - Skipa se algum time é TBD (não resolve por `footballDataId`).
   - Mapeia status externo via `mapExternalStatus()`:
     ```
     TIMED, SCHEDULED, POSTPONED  → SCHEDULED
     IN_PLAY, PAUSED              → LIVE
     FINISHED, AWARDED            → FINISHED
     CANCELLED, SUSPENDED         → CANCELLED
     ```
   - Extrai `score` via `extractScore()` (apenas para LIVE/FINISHED com `fullTime.home/away` válidos).
   - `isCanonicalTransition(existing.status, status)` — transições não-canônicas (ex.: `FINISHED → SCHEDULED`) geram **warning** mas são aceitas (provedor é fonte de verdade).
   - Upsert via `updateOne`:
     - `$set` com todos os campos. Se `score` é `undefined`, **não** entra no `$set` (Mongoose ignora `undefined`).
     - Se a partida tinha score mas o externo não, adiciona `$unset: { score: 1 }` — caso contrário o campo nunca seria removido.
   - Empilha `_id` em `changedIds` quando há mudança real (status, score ou utcDate diferente).

### Resilência ao "score fantasma"

Bug histórico: se uma partida fosse manualmente marcada FINISHED+score e o cron rodasse depois trazendo SCHEDULED, Mongoose silenciosamente ignorava `score: undefined` em `$set` deixando o doc inconsistente (status=SCHEDULED + score do passado). O fix usa `$unset` explícito quando o externo deixou de ter score.

---

## 3. Rebuild de leaderboard + SystemState

Quando `importMatches` devolve `changedIds.length > 0`, `MatchSyncTask` dispara:

1. `LeaderboardService.rebuild()` — query matches `{ status: { $in: [LIVE, FINISHED] }, score: { $exists: true } }` × bets × users ativos, recomputa pontos via `calculateBetScore` e persiste no singleton.
2. `systemState.leaderboardRebuilt()` — atualiza `leaderboardRebuildAt`.

Frontend (`useWatchResults`) consulta `/api/system/state` a cada 30s. Quando `leaderboardRebuildAt` muda, invalida `['bets', 'leaderboard', 'matches', 'stages']` em todas as abas/sessões.

---

## 4. Endpoints públicos de simulação

Habilitam testar o fluxo sem esperar a Copa de fato acontecer:

| Método | Path | Efeito |
|---|---|---|
| `GET` | `/api/stage/advance-next/:code` | Fecha a fase (`deadline = now − 1s`). A próxima vira `OPEN` por derivação. |
| `GET` | `/api/match/advance-next` | Pega a primeira fase `OPEN` + próxima `SCHEDULED` por `utcDate`. Sorteia placar enviesado (mais 0/1/2) e status `LIVE` ou `FINISHED` (50/50). Rebuilda leaderboard. |
| `GET` | `/api/match/advance-next/:code` | Como acima, restrito à fase informada. |

Acompanhe `backend/scripts/simulate.sh` para um workflow automatizado (1 partida/min + 5 min entre fases).

---

## Resumo das crons

| Task            | Trigger                                       | Endpoint externo                                   | Efeito                                              |
|-----------------|-----------------------------------------------|----------------------------------------------------|-----------------------------------------------------|
| `MatchSyncTask` | `OnApplicationBootstrap` + `*/5 * * * *`      | `GET /competitions/WC/teams` + `/matches`          | Upsert teams + matches; rebuild leaderboard se mudou; atualiza `SystemState` |

Definição em `backend/src/schedule/schedule.module.ts`. Habilitada via `ScheduleModule.forRoot()`.

## Idempotência

- `importTeams` e `importMatches` comparam o externo com o local; só escrevem quando há diferença real.
- `LeaderboardService.rebuild()` recomputa do zero — múltiplas chamadas produzem o mesmo resultado.

## Limites e cotas

A Football Data API tem rate limits específicos por plano. A cron unificada faz ~1 request a cada 5 minutos (cobertura 24/7), o que dá ~288 requests/dia — dentro do limite gratuito da maioria dos planos.

A chave (`FOOTBALL_DATA_API_KEY`) é lida via `ConfigService.getOrThrow` — boot falha se ausente.

## Casos de borda

- **API externa fora do ar:** logs de warning; estado local não muda; próxima execução tenta de novo.
- **Resposta com schema diferente do esperado:** o cast `data.matches as FootballDataMatch[]` confia no contrato. Mudanças no provedor podem causar `TypeError` em runtime — capturado pelo `try/catch` externo, logado como erro.
- **Partida `POSTPONED`:** mapeia para `SCHEDULED` (sem score). Palpites continuam válidos.
- **Partida `CANCELLED`:** status `CANCELLED` no schema; `extractScore` retorna `undefined`. Palpites avaliados como `wrong` na próxima rebuild (sem placar válido).
- **Time TBD em partida eliminatória:** `importMatches` skipa essa partida até que ambos os times sejam resolvidos pelo provedor.
