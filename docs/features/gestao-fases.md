# Gestão de fases (lifecycle)

Funcionalidade de backend que controla o ciclo de vida das 7 fases da competição.

- **Módulo:** `backend/src/stage/`
- **Schema:** `backend/src/stage/schemas/stage.schema.ts`
- **Serviço:** `StageService`
- **Cron:** `backend/src/schedule/block-stages.task.ts`

## Estados

```
DISABLED ───[admin: PUT /api/stage/:s {status: OPEN}]───▶ OPEN
                                                          │
                                                          ├──[admin: PUT /api/stage/:s {status: BLOCKED}]──▶ BLOCKED
                                                          │
                                                          └──[cron: BlockStagesTask, deadline expirado]────▶ BLOCKED
```

Outras transições **não são permitidas**. Backend lança `400 BadRequestException: Mudança de status inválida: X → Y`.

## Seed inicial

`StageService.onModuleInit` (`backend/src/stage/stage.service.ts`):

```ts
async onModuleInit() {
  if (já existe alguma fase) return
  insertMany para cada (matchStage, order) em STAGE_ORDER:
    - status: GROUP_STAGE → OPEN; demais → DISABLED
    - deadline: STAGE_DEADLINES[matchStage]
}
```

Acontece apenas uma vez por banco. Em ambientes novos, as 7 fases são criadas automaticamente, com `GROUP_STAGE` já aberta.

`STAGE_DEADLINES` está definido em `shared/src/enums.ts` (datas fixas da Copa 2026 em UTC).

## Abertura de fase (`status: OPEN`)

Endpoint: `PUT /api/stage/:matchStage { status: OPEN }` (admin).

Fluxo em `StageService.update`:

1. Carrega a fase atual; `404` se não existe.
2. Calcula o próximo status esperado a partir do status atual:
   ```ts
   order = [DISABLED, OPEN, BLOCKED]
   expectedNext = order[order.indexOf(current.status) + 1]
   ```
   Se `dto.status !== expectedNext` → `400 Mudança de status inválida`.
3. **Reimporta partidas** chamando `MatchService.importMatches` (sincroniza com Football Data — partidas TBD podem ter virado partidas reais agora).
4. Conta partidas com `valid: false` na fase. Se `> 0` → `400 Não é possível abrir a fase X: N partida(s) sem times definidos`.
5. Se `current.order > 1`:
   - Determina a fase anterior obrigatória:
     - Para `FINAL`: exige `SEMI_FINALS` (não a anterior por ordem, que seria `THIRD_PLACE`)
     - Para as outras: a fase com `order = current.order - 1`
   - A fase anterior precisa estar em `BLOCKED`. Caso contrário → `400`.
6. Persiste o novo status (`OPEN`).
7. Chama `seedBetsForStage(matchStage)`:
   - Lê todos os usuários ativos
   - Para cada um, chama `UserService.seedBetsForUser(userId)`:
     - Identifica as partidas de fases `OPEN | BLOCKED` (incluindo a recém-aberta)
     - Faz `bulkWrite` upsertando palpites em branco (`$setOnInsert: { user, match }`)
   - Idempotente: rodar duas vezes não duplica nada.

### Por que `THIRD_PLACE` e `FINAL` em paralelo?

O calendário real da Copa põe terceiro lugar e final em datas próximas, e o sentido competitivo é abrir ambas após o fim das semifinais. A regra é:

- `THIRD_PLACE.order = 6`, a anterior por ordem é `SEMI_FINALS (5)` ✓
- `FINAL.order = 7`, a anterior por ordem seria `THIRD_PLACE (6)`, **mas a regra de exceção remete a `SEMI_FINALS`**

Resultado: tanto `THIRD_PLACE` quanto `FINAL` podem ser abertas independentemente assim que `SEMI_FINALS` for `BLOCKED`. As duas podem coexistir em `OPEN`.

## Encerramento de fase (`status: BLOCKED`)

Duas formas:

### 1. Manual (admin)

`PUT /api/stage/:matchStage { status: BLOCKED }`.

Fluxo no `StageService.update`: a validação `OPEN → BLOCKED` é a próxima transição esperada (apenas confere e persiste). Nenhum side effect adicional — apenas o campo `status` muda. Palpites existentes permanecem, e o filtro de `BetService.updateBets` (que só altera palpites em fases `OPEN`) começa imediatamente a ignorar tentativas de edição.

### 2. Automática (cron `BlockStagesTask`)

`backend/src/schedule/block-stages.task.ts` — roda a **cada minuto** (`* * * * *`):

```ts
@Cron('* * * * *')
async blockExpiredStages() {
  await this.stageService.blockExpiredStages()
}
```

`StageService.blockExpiredStages` (que recebe `now: Date = new Date()`):

```ts
expired = Stage.find({ status: OPEN, deadline: { $ne: null, $lte: now } })
if (expired.length === 0) return
Stage.updateMany({ _id: { $in: expired._ids }, status: OPEN },
                 { $set: { status: BLOCKED } })
// log: Auto-blocked N stage(s) past deadline: X, Y, ...
```

Características:
- **Idempotente** — o filtro `status: OPEN` evita rebloquear.
- Não dispara nenhum efeito colateral sobre palpites — a partir do momento em que `status === BLOCKED`, palpites simplesmente param de ser editáveis.
- Roda mesmo quando ninguém está logado.

## Listagem

Duas variantes:

| Endpoint                    | Quem usa                | Filtro                    |
|-----------------------------|-------------------------|---------------------------|
| `GET /api/stage/visible`    | Usuário comum           | apenas `OPEN` + `BLOCKED` |
| `GET /api/stage` (admin)    | Painel Admin            | todas                     |

`findVisibleStages()` retorna `StageVisibleItem[]` (em `@bolao/shared`), com `matchStage`, `order`, `status`, `deadline?` (ISO string).

## Helpers internos

`StageService` expõe utilidades usadas por outros serviços:

- `findBlockedStages(): string[]` — nomes das fases bloqueadas
- `findOpenStages(): string[]` — nomes das fases abertas
- `isStageBlocked(matchStage): boolean`
- `existsByMatchStage(matchStage)`

`BetService` usa essas pra:
- Decidir quais partidas podem ter palpites editados (`updateBets` filtra por fases `OPEN`)
- Decidir quais partidas aparecem no agregado (`listAll` filtra por fases `BLOCKED`)

`UserService.seedBetsForUser` usa para criar palpites apenas nas fases `OPEN | BLOCKED`.

## Casos de borda

- **Fase com partidas `valid: false`:** não pode ser aberta. Solução: rodar **Importar Partidas** quando os times eliminatórios já forem conhecidos pela Football Data, ou esperar a próxima execução de `ImportMatchesTask` (diária à 0h).
- **Bloquear antes do deadline:** permitido — admin pode encerrar manualmente a qualquer momento. A cron simplesmente não terá nada a fazer depois (a fase já está em `BLOCKED`).
- **Reabrir uma fase encerrada:** não é permitido. A única transição daqui é `BLOCKED → ∅`. Para reabrir manualmente, seria necessária intervenção direta no Mongo.
- **Deadline em `null`:** a `BlockStagesTask` ignora (filtro `deadline: { $ne: null }`). Em tese, uma fase sem deadline só fecha por ação do admin.
- **Race entre cron e admin:** dois inserts simultâneos são protegidos pelo `updateMany({ status: OPEN })` — quem perde a corrida obtém `modifiedCount: 0` silenciosamente.

## Logs típicos

```
[StageService] Importing matches before opening stage QUARTER_FINALS
[StageService] Stage QUARTER_FINALS updated to OPEN
[StageService] Seeding bets for stage QUARTER_FINALS
[StageService] Seed user <id>: 4 new bet(s) across 8 match(es)
[StageService] Seed stage QUARTER_FINALS: processed 12 active user(s)
[StageService] Bets seeded for stage QUARTER_FINALS

[StageService] Auto-blocked 1 stage(s) past deadline: SEMI_FINALS
```
