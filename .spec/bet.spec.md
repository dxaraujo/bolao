# Especificação — Palpites (`bet`)

- **ID:** SPEC-BET
- **Backend:** `backend/src/bet/` (`bet.controller.ts`, `bet.service.ts`, `schemas/bet.schema.ts`, `dto/update-bets.dto.ts`)
- **Shared:** `MyBetItem`, `BetSubmitItem`, `BetSubmitPayload`, `GroupedBetMatch`, `GroupedBetParticipant`, `BetResult` (`dto.ts`); `calculateBetScore` (`scoring.ts`)
- **Doc narrativa:** [`docs/dominio.md`](../docs/dominio.md) (fluxo "Apostar", espectadores)

## 1. Objetivo

Permitir que participantes ativos registrem previsões de placar (esparsas, tudo-ou-nada) para partidas em fases `OPEN`, e expor a visão consolidada de todos por partida em fases `CLOSED`.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/bet` | JWT |
| `GET /api/bet/all` | JWT |
| `PUT /api/bet` | `ActiveParticipantGuard` (participante) |

## 3. Modelo de dados — `Bet` (timestamps)

| Campo | Tipo | Regra |
|---|---|---|
| `user` | ObjectId → User | obrigatório, indexado |
| `match` | ObjectId → Match | obrigatório, indexado |
| `score` | `{ home, away }` | **sempre presente**, `min:0` |

Índice único `{ user, match }` + índice `{ match }`. **Esparso**: o documento só existe quando o usuário palpitou. Sem flags derivadas (sem `exactScore`, `totalPointsEarned`, …).

## 4. Contratos

- **`PUT /api/bet`** — `BetSubmitDto { items: BetSubmitItem[] }`, `items` 1..200, `@ValidateNested`.
  - `BetSubmitItem { matchId: @IsMongoId, score: { home, away } | null }`, `home`/`away` `@IsInt @Min(0) @Max(MAX_GOALS=20)`.
  - `score` preenchido → upsert; `score: null` → delete. Retorno `{ upserted, deleted }`.
- **`GET /api/bet`** → `MyBetItem[]` (partidas visíveis + bet do usuário + `result?`).
- **`GET /api/bet/all`** → `GroupedBetMatch[]` (fases CLOSED, left-join ativos × bets, com `totals`).

## 5. Requisitos funcionais

- **RF-BET-1** — `GET /api/bet` lista partidas em fases **não-LOCKED** (OPEN/CLOSED), ordenadas por `utcDate, footballDataId`, anexando o palpite do usuário (se houver) e `result` via `calculateBetScore`.
- **RF-BET-2** — `PUT /api/bet` processa o lote como `bulkWrite` **ordenado** (score→upsert, null→delete). `upserted = upsertedCount + modifiedCount`.
- **RF-BET-3** — `GET /api/bet/all` retorna partidas de fases **CLOSED** com um `participant` por usuário ativo (ordenado por `name`), incluindo quem não palpitou (`notBet`), e `totals` agregados por categoria. Vazio se não houver fase CLOSED.

## 6. Regras de negócio — validação de submit (por item, antes de escrever)

Em ordem; qualquer falha aborta **todo** o lote (tudo-ou-nada):

- **RN-BET-1** — Usuário existe e `isActive` (recheck no banco, não só JWT) → senão `404`/`403`.
- **RN-BET-2** — Partida existe → senão `404`.
- **RN-BET-3** — Partida tem `homeTeam` e `awayTeam` resolvidos → senão `409`.
- **RN-BET-4** — `getStageState` da fase da partida é `OPEN` → senão `409`.
- **RN-BET-5** — `match.status === SCHEDULED` → senão `409` (já iniciou/finalizou).
- **RN-BET-6** — `score.home`/`score.away` inteiros (DTO já garante `0..20`) → senão `400`.

## 7. Casos de borda e erros

- **CB-BET-1** — Espectador chama `PUT /api/bet` → `403` (guard) e, se passasse, recheck no service → `403`.
- **CB-BET-2** — `items` vazio ou > 200 → `400` (DTO).
- **CB-BET-3** — `score: null` para palpite inexistente → `deleteOne` no-op; conta `deleted: 0`.
- **CB-BET-4** — Partida em fase `LOCKED` ou `CLOSED` → `409` (`StageNotOpen`).
- **CB-BET-5** — Bolão (`/api/bet/all`) só mostra fases CLOSED — evita vazar palpites de fase ainda OPEN.

## 8. Dependências

- [user](./user.spec.md) (gate `isActive`), [stage](./stage.spec.md) (estado OPEN/CLOSED), [match](./match.spec.md), [scoring](./scoring.spec.md).
