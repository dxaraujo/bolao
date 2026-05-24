# Domínio

Conceitos, entidades e regras de negócio do Bolão da Copa 2026.

## Glossário

| Termo (PT-BR)     | Identificador técnico | Significado                                                          |
|-------------------|-----------------------|----------------------------------------------------------------------|
| Usuário           | `User`                | Pessoa autenticada via Google. Apenas usuários **ativos** participam |
| Seleção           | `Team`                | Time/seleção da Copa do Mundo                                        |
| Partida           | `Match`               | Jogo individual entre duas seleções, com data e fase                 |
| Fase              | `Stage`               | Etapa da competição (fase de grupos, oitavas, quartas, …)            |
| Palpite / Aposta  | `Bet`                 | Previsão de placar de um usuário para uma partida                    |
| Pontuação         | `totalPointsEarned`   | Pontos somados pelo usuário ao longo da competição                   |
| Ranking           | `ranking`             | Posição do usuário no ranking geral, calculada por critério ordenado |
| Grupo             | `Match.group`         | Grupo da fase de grupos (ex.: `A`, `B`, …)                           |
| Bolão             | —                     | Conjunto de palpites de **todos** os usuários ativos                 |

## Entidades

### Usuário (`User`)

`backend/src/user/schemas/user.schema.ts`

| Campo                 | Tipo        | Default | Descrição                                                                 |
|-----------------------|-------------|---------|---------------------------------------------------------------------------|
| `googleSub`           | string      | —       | ID único do Google (`sub` do ID token). Indexado, único.                  |
| `name`                | string      | —       | Nome completo retornado pelo Google                                       |
| `email`               | string      | —       | E-mail retornado pelo Google                                              |
| `picture`             | string      | `''`    | URL relativa local (`/static/users/<id>.<ext>`) ou URL externa fallback   |
| `exactScore`          | number      | `0`     | Quantidade de placares exatos                                             |
| `winnerWithGoal`      | number      | `0`     | Quantidade de "vencedor + gol"                                            |
| `correctWinner`       | number      | `0`     | Quantidade de "vencedor"                                                  |
| `oneGoalCorrect`      | number      | `0`     | Quantidade de "acertou um gol"                                            |
| `wrong`               | number      | `0`     | Quantidade de erros                                                       |
| `totalPointsEarned`   | number      | `0`     | Pontos totais acumulados                                                  |
| `ranking`             | number      | `0`     | Posição no ranking (1 = líder)                                            |
| `isAdmin`             | boolean     | `false` | Acesso ao Painel Admin                                                    |
| `isActive`            | boolean     | `false` | Participa do bolão. Inativo não recebe palpites em branco                 |

> **Important:** os contadores e o ranking são **materializados** no documento do usuário pelo `ResultService` cada vez que resultados mudam. Não há cálculo on-the-fly nas rotas de leitura — `GET /api/ranking` apenas lê.

### Seleção (`Team`)

`backend/src/team/schemas/team.schema.ts`

| Campo            | Descrição                                                  |
|------------------|------------------------------------------------------------|
| `footballDataId` | ID externo da Football Data API (único)                    |
| `name`           | Nome completo (ex.: "Brazil")                              |
| `shortName`      | Nome curto (ex.: "Brazil")                                 |
| `tla`            | Sigla de 3 letras (ex.: "BRA")                             |
| `crest`          | URL relativa local (`/static/teams/BRA.png`) ou URL externa |
| `lastUpdated`    | Data da última atualização (vinda da API externa)          |

### Partida (`Match`)

`backend/src/match/schemas/match.schema.ts`

| Campo            | Tipo                       | Descrição                                                       |
|------------------|----------------------------|-----------------------------------------------------------------|
| `footballDataId` | number (único)             | ID externo da partida                                           |
| `utcDate`        | Date                       | Data e hora em UTC                                              |
| `status`         | `MatchStatus`              | TIMED, SCHEDULED, LIVE, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED |
| `stage`          | `MatchStage`               | Fase à qual a partida pertence                                  |
| `group`          | string? (ex.: "A")         | Grupo, apenas para `GROUP_STAGE`                                |
| `homeTeam`       | ObjectId → Team (nullable) | Time mandante                                                   |
| `awayTeam`       | ObjectId → Team (nullable) | Time visitante                                                  |
| `homeTeamScore`  | number?                    | Gols do mandante (definido quando IN_PLAY/PAUSED/FINISHED)      |
| `awayTeamScore`  | number?                    | Gols do visitante                                               |
| `valid`          | boolean                    | `true` se ambos os times existem na base. Inválidas são ocultas |
| `lastUpdated`    | Date                       | Última atualização vinda da API externa                         |

**Por que `valid`?** A Football Data API publica o calendário com slots "TBD" para fases eliminatórias antes dos times serem conhecidos. Essas partidas ficam `valid: false` e são ignoradas em listagens e seeds de palpites até que a importação encontre os times reais.

### Fase (`Stage`)

`backend/src/stage/schemas/stage.schema.ts`

| Campo        | Tipo            | Descrição                                                            |
|--------------|-----------------|----------------------------------------------------------------------|
| `matchStage` | `MatchStage`    | Identificador da fase (único)                                        |
| `order`      | number (1–7)    | Ordem canônica da fase                                               |
| `status`     | `StageStatus`   | `DISABLED`, `OPEN` ou `BLOCKED`                                      |
| `deadline`   | Date?           | Prazo fixo para fechamento automático das apostas                    |

#### Ordem e prazos canônicos

Definidos em `shared/src/enums.ts` (`STAGE_ORDER` e `STAGE_DEADLINES`):

| Ordem | `MatchStage`       | Prazo de apostas (UTC)             |
|-------|--------------------|------------------------------------|
| 1     | `GROUP_STAGE`      | 2026-06-11 15:00:00 Z              |
| 2     | `LAST_32`          | 2026-06-28 15:00:00 Z              |
| 3     | `LAST_16`          | 2026-07-04 16:00:00 Z              |
| 4     | `QUARTER_FINALS`   | 2026-07-09 17:00:00 Z              |
| 5     | `SEMI_FINALS`      | 2026-07-14 16:00:00 Z              |
| 6     | `THIRD_PLACE`      | 2026-07-18 17:00:00 Z              |
| 7     | `FINAL`            | 2026-07-19 15:00:00 Z              |

#### Seed inicial

`StageService.onModuleInit` cria todas as 7 fases na primeira inicialização do backend, com:
- `GROUP_STAGE`: `status: OPEN`
- Demais: `status: DISABLED`
- `deadline`: lido de `STAGE_DEADLINES`

#### Ciclo de vida

```
DISABLED ───[admin abre]───▶ OPEN ───[admin encerra]───▶ BLOCKED
                              │
                              │ ou
                              └──[BlockStagesTask: deadline passou]──▶ BLOCKED
```

Detalhes completos em [features/gestao-fases.md](./features/gestao-fases.md).

### Palpite (`Bet`)

`backend/src/bet/schemas/bet.schema.ts`

| Campo                 | Tipo               | Descrição                                                  |
|-----------------------|--------------------|------------------------------------------------------------|
| `user`                | ObjectId → User    | Apostador                                                  |
| `match`               | ObjectId → Match   | Partida                                                    |
| `homeTeamScore`       | number?            | Palpite para gols do mandante                              |
| `awayTeamScore`       | number?            | Palpite para gols do visitante                             |
| `exactScore`          | boolean            | Acertou placar exato                                       |
| `winnerWithGoal`      | boolean            | Acertou vencedor e o gol de um dos times                   |
| `correctWinner`       | boolean            | Acertou apenas o vencedor                                  |
| `oneGoalCorrect`      | boolean            | Acertou um dos gols mas errou o vencedor                   |
| `wrong`               | boolean            | Errou totalmente                                           |
| `totalPointsEarned`   | `PointsEarned`     | Pontos: `0 | 1 | 2 | 3 | 5`                                |

Apenas **uma** das flags booleanas é `true` em cada palpite avaliado (ver tabela de pontuação abaixo). Palpites sem `homeTeamScore`/`awayTeamScore` definidos ficam todos `false` com `totalPointsEarned: 0`.

### Configuração global (`Config`)

`backend/src/config/schemas/config.schema.ts` — collection `config`, um único documento.

| Campo                    | Default | Descrição                                       |
|--------------------------|---------|-------------------------------------------------|
| `lastUpdateResults`      | `null`  | Timestamp da última execução de pontuação       |
| `pointsExactScore`       | `5`     | Pontos por placar exato                         |
| `pointsWinnerWithGoal`   | `3`     | Pontos por vencedor + gol                       |
| `pointsOneGoalCorrect`   | `2`     | Pontos por acertar um gol                       |
| `pointsCorrectWinner`    | `1`     | Pontos por acertar apenas o vencedor            |

## Regras de pontuação

> ⚠️ **Atenção à divergência:** a `Config` armazena os valores configuráveis (5/3/2/1), porém o motor de cálculo em `backend/src/match/result.service.ts` (`calculateBetScore`) utiliza valores **hardcoded** (`5`, `3`, `2`, `1`). A `Config` é lida apenas pela UI para exibir a tabela de pontos. Mudar os valores na `Config` **não** altera o cálculo até que o motor seja parametrizado.

A função `calculateBetScore(bet, match)` em `backend/src/match/result.service.ts` é o único ponto que decide o resultado de um palpite. Pseudocódigo:

```
se palpite ou placar real são inválidos → ZERO (todas flags false, 0 pontos)

se placar do palpite == placar real
    → exactScore = true, 5 pontos

vencedorDoPalpite = winner(palpite)   // 'A' (casa), 'B' (visitante) ou 'E' (empate)
vencedorReal      = winner(real)

se vencedorDoPalpite == vencedorReal:
    acertouUmGol = homeTeamScore coincide  OU  awayTeamScore coincide
    se acertouUmGol → winnerWithGoal = true, 3 pontos
    senão           → correctWinner  = true, 2 pontos

senão (errou o vencedor):
    acertouSoUmGol = homeTeamScore coincide  OU  awayTeamScore coincide
    se acertouSoUmGol → oneGoalCorrect = true, 1 ponto
    senão             → wrong          = true, 0 pontos
```

### Tabela resumida

| Situação                                                   | Flag             | Pontos |
|------------------------------------------------------------|------------------|--------|
| Placar exato                                               | `exactScore`     | **5**  |
| Acertou vencedor (ou empate) **e** um dos gols             | `winnerWithGoal` | **3**  |
| Acertou apenas o vencedor (ou empate)                      | `correctWinner`  | **2**  |
| Errou o vencedor mas acertou um dos gols                   | `oneGoalCorrect` | **1**  |
| Errou totalmente                                           | `wrong`          | **0**  |
| Palpite ou placar ausente                                  | nenhuma          | **0**  |

### Critério de desempate no ranking

Em `ResultService.compareRows`, usuários são ordenados por:

1. `totalPointsEarned` — pontos totais (desc)
2. `exactScore` — placares exatos (desc)
3. `winnerWithGoal` — vencedores + gol (desc)
4. `correctWinner` — vencedores (desc)
5. `oneGoalCorrect` — um gol (desc)

Empates de critério são tratados explicitamente: usuários empatados recebem o mesmo `ranking` numérico e o próximo posto pula tantas posições quantos forem os empatados (1, 2, 2, 4…).

## Fluxos principais

### 1. Login

1. Usuário clica em "Entrar com Google" → frontend obtém ID token via `@react-oauth/google`
2. Frontend envia `POST /auth/google { credential }`
3. Backend verifica o ID token com `google-auth-library` (audience = `GOOGLE_CLIENT_ID`)
4. Usuário é encontrado ou criado (`upsert` por `googleSub`). Avatar é baixado para `/static/users/`
5. Backend retorna `{ token: <JWT> }`
6. Frontend persiste o JWT e decodifica para extrair `_id`, `name`, `email`, `picture`, `isAdmin`, `isActive`

> Novos usuários começam com `isActive: false` e **não recebem palpites**. Um admin precisa ativá-los.

### 2. Importação inicial (admin)

1. Admin executa `POST /api/team/import` → baixa todas as seleções e escudos
2. Admin executa `POST /api/match/import` → baixa o calendário; partidas sem ambos os times definidos ficam `valid: false`
3. As 7 fases já foram criadas no boot, com `GROUP_STAGE` em `OPEN`

### 3. Abertura de uma fase

1. Admin chama `PUT /api/stage/:matchStage { status: OPEN }`
2. `StageService.update` valida:
   - Transição é apenas para o **próximo** status (DISABLED → OPEN → BLOCKED)
   - Antes de abrir, reimporta partidas (`MatchService.importMatches`)
   - Nenhuma partida `valid: false` pode existir na fase
   - A fase anterior precisa estar `BLOCKED` (exceção: `FINAL` exige `SEMI_FINALS` bloqueada)
3. Fase é atualizada para `OPEN`
4. `seedBetsForStage` cria palpites em branco para todos os usuários ativos (upsert idempotente)

### 4. Apostar

Enquanto a fase está `OPEN`:
1. Frontend faz `PUT /api/bet/updateBets { bets: [...] }`
2. `BetService.updateBets` aplica `bulkWrite` com **filtro de segurança**: só atualiza palpites cujo `match` pertença a uma fase ainda `OPEN` (palpites em fases `BLOCKED` são ignorados silenciosamente)

### 5. Encerramento de uma fase

Acontece de duas formas:
- **Manual:** admin envia `PUT /api/stage/:matchStage { status: BLOCKED }`
- **Automático:** `BlockStagesTask` (cada minuto) bloqueia toda fase `OPEN` cujo `deadline` já passou

A partir desse ponto, palpites da fase não podem mais ser editados, e o agrupamento aparece em `GET /api/bet/all` (consumido pela tela [Bolão](./features/bolao.md)).

### 6. Atualização de resultados

`UpdateScoresTask` (a cada 5 min entre 7h e 20h):
1. `ScoreService.updateScores` consulta a Football Data API
2. Para cada partida iniciada, compara placar/status com o registro local
3. Quando houver mudança, atualiza a partida e empilha o `_id` em `changedMatchIds`
4. `ResultService.updateResults(changedMatchIds)`:
   - Recalcula `BetScore` para todos os palpites afetados (`bulkWrite`)
   - Re-agrega contadores por usuário ativo (`aggregate $group`)
   - Recalcula `ranking` aplicando o critério de desempate
   - Persiste totais e ranking em `User` (`bulkWrite`)
   - Marca `Config.lastUpdateResults` com `new Date()`

Detalhes em [features/sincronizacao-externa.md](./features/sincronizacao-externa.md) e [features/pontuacao.md](./features/pontuacao.md).

### 7. Ativação de um novo usuário

Quando um admin ativa um usuário (`PUT /api/user/:id { isActive: true }`):
1. `UserService.update` detecta a transição `false → true`
2. Chama `seedBetsForUser`, que cria palpites em branco para todas as partidas das fases `OPEN` ou `BLOCKED`

Quando desativa (`true → false`), `removeBetsForUser` apaga todos os palpites do usuário.
