# API REST

API NestJS exposta pelo backend. Documentação OpenAPI navegável (Swagger UI) em `http://localhost:3000/api/docs` quando `NODE_ENV !== 'production'`.

## Convenções

- **Base URL:** `http://localhost:3000` em desenvolvimento. Em produção, a base é o domínio servido pelo backend.
- **Formato:** todas as respostas usam `application/json`. O envelope padrão é:
  ```ts
  type ApiSuccess<T> = { data: T }
  type ApiErrorBody  = { error: { code: string; message: string; details?: unknown } }
  type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody
  ```
  O type guard `isApiError` está em `@bolao/shared`.
- **Autenticação:** JWT no header `Authorization: Bearer <token>`. Token obtido em `POST /auth/google`.
- **Erros não tratados** são capturados por `AllExceptionsFilter` e mapeados para o envelope `ApiErrorBody`.

## Autorização

O `JwtAuthGuard` é registrado como `APP_GUARD` global em `app.module.ts`. **Toda rota exige JWT por padrão**; exceções são marcadas com `@Public()`. Algumas rotas adicionam `AdminGuard`, que exige `isAdmin: true` no JWT.

| Tipo de rota   | Marcação                              |
|----------------|---------------------------------------|
| Pública        | `@Public()`                           |
| Autenticada    | (default — nada a fazer)              |
| Admin          | `@UseGuards(AdminGuard)`              |

---

## Endpoints

### Saúde

#### `GET /healthcheck` — público

Liveness probe.

**Resposta** `200 OK`:
```json
{ "data": "OK" }
```

---

### Autenticação

#### `POST /auth/google` — público

Login com Google ID token.

**Body:**
```json
{ "credential": "<google-id-token>" }
```

**Comportamento:**
- Verifica o ID token com `google-auth-library` (audience = `GOOGLE_CLIENT_ID`)
- Cria ou atualiza o usuário por `googleSub` (upsert)
- Baixa o avatar para `/static/users/` se a URL externa mudou
- Emite JWT assinado com `AUTH_SECRET`, expiração `JWT_EXPIRES_IN` (default `30d`)

**Resposta** `200 OK`:
```json
{ "token": "<jwt>" }
```

**Claims do JWT** (`JwtPayload`):
- `_id` (string)
- `email`
- `name`
- `picture?`
- `isAdmin`
- `isActive`

**Erros:**
- `401 Unauthorized` — token inválido, payload incompleto, e-mail não verificado

---

### Usuário (`api/user`)

#### `GET /api/user/me`

Retorna o documento completo do usuário autenticado.

**Resposta** `200 OK`:
```json
{ "data": { /* User */ } }
```

#### `GET /api/user/active`

Lista todos os usuários com `isActive: true` (usado em telas que precisam ranquear).

**Resposta:** `{ "data": User[] }`

#### `GET /api/user` — admin

Lista todos os usuários (ativos e inativos).

#### `PUT /api/user/:id` — admin

Atualiza um usuário. DTO em `backend/src/user/dto/update-user.dto.ts`. As transições de `isActive` têm efeitos colaterais:

- `false → true`: dispara `UserService.seedBetsForUser`, criando palpites em branco para todas as partidas das fases `OPEN` ou `BLOCKED`
- `true → false`: dispara `UserService.removeBetsForUser`, apagando todos os palpites do usuário

---

### Seleções (`api/team`)

#### `POST /api/team/import` — admin

Importa todas as seleções da Football Data API. Para cada time:
- Cria se não existir
- Atualiza se `lastUpdated` externo for mais recente
- Sempre que o escudo local (`/static/teams/<TLA>.png`) está faltando no disco, re-baixa

---

### Fases (`api/stage`)

#### `GET /api/stage/visible`

Lista fases visíveis ao usuário comum (`OPEN` + `BLOCKED`), ordenadas por `order`.

**Resposta:** `{ "data": StageVisibleItem[] }` — cada item com `matchStage`, `order`, `status`, `deadline?`.

#### `GET /api/stage` — admin

Lista **todas** as fases, incluindo `DISABLED`.

#### `PUT /api/stage/:matchStage` — admin

Avança o status de uma fase. Validações:
- Apenas o **próximo** status na sequência `DISABLED → OPEN → BLOCKED` é aceito
- Para `OPEN`:
  - Reimporta partidas antes (garante que slots TBD virem reais)
  - Falha com `400` se alguma partida da fase tiver `valid: false`
  - Falha com `400` se a fase anterior não estiver `BLOCKED` (exceção: `FINAL` exige `SEMI_FINALS` bloqueada; `THIRD_PLACE` e `FINAL` podem coexistir em `OPEN`)
- Para `OPEN`, após persistir, chama `seedBetsForStage` (cria palpites em branco para todos os usuários ativos)

**Body:** `UpdateStageDto` em `backend/src/stage/dto/update-stage.dto.ts`.

---

### Partidas (`api/match`)

#### `GET /api/match`

Lista partidas das fases `OPEN` ou `BLOCKED`, apenas com `valid: true`. Ordenadas por `utcDate` ascendente e `footballDataId` como desempate.

#### `POST /api/match/import` — admin

Reimporta o calendário completo da competição. Cada partida é criada ou atualizada por `footballDataId`. Marca `valid: true/false` em função da existência local dos times.

#### `POST /api/match/update-scores` — admin

Dispara manualmente o mesmo fluxo da cron `UpdateScoresTask`. Útil para forçar uma sincronização imediata.

---

### Palpites (`api/bet`)

#### `GET /api/bet`

Lista os palpites do **usuário autenticado**. Já vem com os dados das seleções (`homeTeam`, `awayTeam`) e o placar real da partida em `matchHomeTeamScore` / `matchAwayTeamScore`.

**Resposta:** `{ "data": BetListItem[] }` — ver `BetListItem` em `@bolao/shared`.

#### `GET /api/bet/all`

Apostas **agrupadas por partida** — apenas partidas de fases `BLOCKED` e apenas usuários ativos. Cada item tem:
- Metadados da partida (`matchId`, `utcDate`, `stage`, `group`, times, placar real)
- Contadores agregados (`exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`, `total`)
- Lista `bets` com cada usuário e o resultado dele

**Resposta:** `{ "data": GroupedBet[] }`.

Consumido pela tela [Bolão](./features/bolao.md).

#### `PUT /api/bet/updateBets`

Salva palpites em lote. Apenas palpites cuja partida pertença a uma fase ainda `OPEN` são atualizados — palpites em fases bloqueadas passam pelo filtro silenciosamente sem efeito.

**Body:**
```ts
{
  bets: Array<{
    _id: string,
    homeTeamScore: number | null,
    awayTeamScore: number | null
  }>
}
```

---

### Ranking (`api/ranking`)

#### `GET /api/ranking`

Lista usuários ativos com:
- `ranking`, `totalPointsEarned`
- Quebradores: `exactScore`, `winnerWithGoal`, `correctWinner`, `oneGoalCorrect`, `wrong`

Ordenado por `ranking` desc e, em empate, `name` (PT-BR locale).

> Note: os valores aqui são lidos do documento `User`, materializados pelo `ResultService`. Não há cálculo on-the-fly.

---

### Estatísticas (`api/stats`)

#### `GET /api/stats/overview`

KPIs gerais.

**Resposta:**
```ts
{
  data: {
    totalMatches: number,         // partidas FINISHED
    totalExactBets: number,        // total de placares exatos
    totalCorrectBets: number,      // soma de winnerWithGoal | oneGoalCorrect | correctWinner
    leader: { _id, name, picture, totalPointsEarned } | null
  }
}
```

#### `GET /api/stats/accuracy-by-user`

Acerto por usuário, considerando apenas partidas **finalizadas** e usuários ativos.

**Resposta:** `{ "data": UserAccuracy[] }` — `accuracyPct = round(exactScore / totalBets * 100)`. Ordenado por `accuracyPct` desc + `name`.

#### `GET /api/stats/distribution`

Distribuição global dos resultados (em quantidade e %).

**Resposta:** `{ "data": Distribution }`:
```ts
{
  exact: { count, pct },
  winnerWithGoal: { count, pct },
  correctWinner: { count, pct },
  oneGoalCorrect: { count, pct },
  wrong: { count, pct },
  totalEvaluatedBets: number
}
```

`pct` é calculado sobre `totalEvaluatedBets` e arredondado para inteiro.

---

### Configuração (`api/config`)

#### `GET /api/config`

Retorna o documento singleton de configuração: timestamp da última pontuação e pesos da tabela.

**Resposta:** `{ "data": ConfigPayload }` — ver tipo em `@bolao/shared`.

---

## Resumo por método

| Método | Path                                   | Auth     | Notas                                                  |
|--------|----------------------------------------|----------|--------------------------------------------------------|
| GET    | `/healthcheck`                         | público  |                                                        |
| POST   | `/auth/google`                         | público  | Body `{ credential }`                                  |
| GET    | `/api/user/me`                         | JWT      | Usuário autenticado                                    |
| GET    | `/api/user/active`                     | JWT      |                                                        |
| GET    | `/api/user`                            | admin    |                                                        |
| PUT    | `/api/user/:id`                        | admin    | Side effects em `isActive`                             |
| POST   | `/api/team/import`                     | admin    | Football Data API                                      |
| GET    | `/api/stage/visible`                   | JWT      | OPEN + BLOCKED                                         |
| GET    | `/api/stage`                           | admin    | Inclui DISABLED                                        |
| PUT    | `/api/stage/:matchStage`               | admin    | Avança status; valida pré-requisitos                   |
| GET    | `/api/match`                           | JWT      | Apenas fases OPEN/BLOCKED, `valid: true`               |
| POST   | `/api/match/import`                    | admin    | Football Data API                                      |
| POST   | `/api/match/update-scores`             | admin    | Equivalente manual à cron                              |
| GET    | `/api/bet`                             | JWT      | Palpites do usuário                                    |
| GET    | `/api/bet/all`                         | JWT      | Bolão (apenas BLOCKED)                                 |
| PUT    | `/api/bet/updateBets`                  | JWT      | Filtro: só palpites em fases OPEN                      |
| GET    | `/api/ranking`                         | JWT      |                                                        |
| GET    | `/api/stats/overview`                  | JWT      |                                                        |
| GET    | `/api/stats/accuracy-by-user`          | JWT      |                                                        |
| GET    | `/api/stats/distribution`              | JWT      |                                                        |
| GET    | `/api/config`                          | JWT      |                                                        |

---

## Recursos estáticos

O backend serve `/static/*` (não é uma rota REST). Arquivos:

- `/static/teams/<TLA>.png` — escudos das seleções
- `/static/users/<userId>.<ext>` — fotos de perfil

`Cache-Control: public, max-age=31536000, immutable`.
