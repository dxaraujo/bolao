# Sincronização com Football Data API

Integração com a [Football Data API](https://www.football-data.org/) (`/competitions/WC/...?season=2026`) para importar times, partidas e placares.

- **Configuração:** env `FOOTBALL_DATA_API_URL`, `FOOTBALL_DATA_API_KEY`
- **Header de auth:** `X-Auth-Token: <key>`
- **Endpoints externos usados:**
  - `GET {API_URL}/competitions/WC/teams?season=2026`
  - `GET {API_URL}/competitions/WC/matches?season=2026`

Três operações principais usam essa API: **importar times**, **importar partidas** e **atualizar placares**. As duas últimas têm cron, e todas as três têm acionamento manual via Admin.

---

## 1. Importar times

- **Serviço:** `TeamService.importTeams` (`backend/src/team/team.service.ts`)
- **Endpoint admin:** `POST /api/team/import`
- **Cron:** não há — disparado manualmente, geralmente uma única vez no setup

### Fluxo

1. `GET {API}/competitions/WC/teams?season=2026`
2. Para cada time externo:
   - Se não existe localmente: cria com `name`, `shortName`, `tla`, `crest`, `lastUpdated`. Baixa o escudo para `static/teams/<TLA>.png` e armazena o caminho local em `crest`.
   - Se existe e `lastUpdated` externo é mais recente: atualiza tudo e re-baixa escudo.
   - Se existe e está em dia mas o arquivo local sumiu do disco: re-baixa.

### Auto-correção no boot

`TeamService.onModuleInit` → `syncMissingCrests()`:
- Procura times com `crest` apontando para `/static/...`
- Para cada um, verifica se o arquivo existe em disco
- Se sumiu, busca novamente a API externa e re-baixa apenas os que faltam

Útil para deploys onde o volume foi recriado mas o Mongo persistiu o estado.

---

## 2. Importar partidas

- **Serviço:** `MatchService.importMatches` (`backend/src/match/match.service.ts`)
- **Endpoint admin:** `POST /api/match/import`
- **Cron:** `ImportMatchesTask` em `backend/src/schedule/import-matches.task.ts`, expressão `0 0 * * *` (diariamente à 00:00)

### Fluxo

1. `GET {API}/competitions/WC/matches?season=2026`
2. Para cada `externalMatch`:
   - Resolve `homeTeam` e `awayTeam` localmente por `footballDataId` (pode ser `null` se ainda é TBD)
   - `valid = !!homeTeam && !!awayTeam`
   - Monta `matchData` com `utcDate`, `status`, `stage`, `group`, refs aos times, `valid`, `lastUpdated`
   - Se a partida não existe no banco: cria
   - Se existe e `lastUpdated` externo é mais recente: atualiza
   - Se existe e está em dia: ignora

### Por que rodar diariamente?

Em fases eliminatórias, os times de cada partida só são definidos depois das fases anteriores. A Football Data API atualiza esses slots TBD à medida que os classificados são definidos. Rodar diariamente garante que slots TBD virem partidas válidas o quanto antes — sem isso, o admin não consegue **abrir** a fase eliminatória (a validação rejeita partidas `valid: false`).

### Acionamento extra no fluxo de abrir fase

Antes de mudar `status: DISABLED → OPEN`, `StageService.update` chama `MatchService.importMatches` na hora. Garante que os times estejam atualizados no instante em que a fase é aberta, mesmo se a cron diária ainda não rodou desde a última definição.

---

## 3. Atualizar placares (e disparar pontuação)

- **Serviço:** `ScoreService.updateScores` (`backend/src/match/score.service.ts`)
- **Endpoint admin:** `POST /api/match/update-scores`
- **Cron:** `UpdateScoresTask` em `backend/src/schedule/update-scores.task.ts`, expressão `*/5 7-20 * * *` (a cada 5 min, das 7h às 20h)

### Por que janela 7h–20h?

Os jogos da Copa 2026 acontecem em janelas previsíveis. Restringir a cron à janela do dia evita gastar requisições da Football Data API (a key tem cotas) fora de horário útil. Em emergências, o admin pode acionar manualmente a qualquer hora.

### Fluxo

1. `GET {API}/competitions/WC/matches?season=2026`
2. Filtra apenas partidas com `utcDate <= now` ("startedMatches")
3. Para cada partida iniciada:
   - Pula se `score.fullTime.home/away` é nulo ou negativo
   - Pula se a partida não existe localmente (warning)
   - Pula se a partida local está em `FINISHED` (não há mais o que atualizar)
   - Pula se o placar e status externos são iguais aos locais
   - Caso contrário: chama `MatchService.updateMatch(_id, status, homeScore, awayScore)` e empilha o `_id` em `changedMatchIds`
4. Se `changedMatchIds.length > 0`:
   - Chama `ResultService.updateResults(changedMatchIds)` — recalcula palpites, agrega contadores, recalcula ranking, persiste em `User`, atualiza `Config.lastUpdateResults`
   - Detalhes em [pontuacao.md](./pontuacao.md)

### Idempotência

Múltiplas execuções com os mesmos placares externos têm efeito apenas na **primeira** rodada (depois, o filtro "placar igual" sai cedo). O `ResultService.updateResults` também é idempotente — recalcular tudo de novo produz o mesmo resultado.

### Resiliência a erros

- Erro de rede ou status HTTP não-OK: warning no log, sem mudar nada.
- Exceção dentro do loop: capturada em `try/catch`. Mesmo assim, os `changedMatchIds` acumulados antes do erro vão ser processados na chamada de `updateResults` (segundo `try/catch` separado).
- Falha em `updateResults`: logada como erro. Próxima execução tentará de novo (os palpites afetados serão lidos de novo na agregação).

---

## Resumo das crons

| Task                  | Cron               | Endpoint externo                                      | Efeito                                                |
|-----------------------|--------------------|-------------------------------------------------------|-------------------------------------------------------|
| `ImportMatchesTask`   | `0 0 * * *`        | `GET /competitions/WC/matches?season=2026`            | Upsert de partidas; resolve slots TBD                 |
| `UpdateScoresTask`    | `*/5 7-20 * * *`   | `GET /competitions/WC/matches?season=2026`            | Atualiza placares e dispara pontuação                 |
| `BlockStagesTask`     | `* * * * *`        | (interno, sem API externa)                            | Bloqueia fases com `deadline` expirado                |

Definições em `backend/src/schedule/schedule.module.ts`. Habilitadas via `ScheduleModule.forRoot()`.

## Tabela `lastUpdated`

Tanto `Team` quanto `Match` guardam o `lastUpdated` retornado pela Football Data. Esse campo é a chave da idempotência das duas importações:

- Se o externo é **mais recente** → atualiza
- Se está **em dia** → ignora (a menos que o arquivo local esteja faltando, no caso de escudos)

Isso reduz drasticamente as escritas no Mongo nas rodadas em que nada mudou no provedor.

## Limites e cotas

A Football Data API tem rate limits específicos por plano. As crons foram dimensionadas para ficar bem abaixo do limite gratuito:
- 1 request/dia para `ImportMatchesTask`
- ~13 × N requests para `UpdateScoresTask` durante a janela 7h–20h (cada execução faz 1 request à API externa)
- 0 requests para `BlockStagesTask`

A chave (`FOOTBALL_DATA_API_KEY`) é lida via `ConfigService.getOrThrow` — boot falha se ausente.

## Casos de borda

- **API externa fora do ar:** logs de warning; estado local não muda; próxima execução tenta de novo.
- **Resposta com schema diferente do esperado:** o cast `data.matches as FootballDataMatch[]` confia no contrato. Mudanças no provedor podem causar `TypeError` em runtime — capturado pelo `try/catch` externo, logado como erro.
- **Partida `POSTPONED` ou `CANCELLED`:** a sincronização propaga o status, mas o `ScoreService` só **atualiza** se algo mudou. Palpites na partida ficam com flag `wrong` se foram avaliados antes do cancelamento; podem ficar pendentes (todas flags `false`) se nunca houve placar.
- **Reabertura de cota:** se o admin desabilita um usuário e o reativa, `seedBetsForUser` cria palpites em branco para todas as partidas das fases `OPEN`/`BLOCKED` — o `ResultService` na próxima rodada vai avaliá-los como `wrong` (já que estão sem placar) ou `pending` (em fases ainda não jogadas).
