# Especificação — Fases (`stage`)

- **ID:** SPEC-STAGE
- **Backend:** `backend/src/stage/` (`stage.controller.ts`, `stage.service.ts`, `schemas/stage.schema.ts`, `dto/update-stage.dto.ts`)
- **Shared:** `MatchStage`, `StageState`, `STAGE_ORDER`, `STAGE_DEADLINES`, `STAGE_EXPECTED_MATCHES`, `STAGE_PREDECESSOR` (`enums.ts`); `getStageState`, `findPredecessor`, `StageInput` (`stage-state.ts`); `StagePayload`, `StageReadinessItem` (`dto.ts`)
- **Visão geral:** [`README.md`](./README.md) (fluxo "Mudança de estado da fase")

## 1. Objetivo

Representar as etapas da competição com `deadline` mutável, derivando o estado `LOCKED/OPEN/CLOSED` em tempo real (sem status persistido) e expondo contadores de progresso.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/stage` | JWT |
| `GET /api/stage/readiness` | Admin |
| `PATCH /api/stage/:code` | Admin |

## 3. Modelo de dados — `Stage` (timestamps)

| Campo | Tipo | Regra |
|---|---|---|
| `code` | `MatchStage` | **único**, indexado |
| `order` | number 1..7 | **único**, indexado |
| `deadline` | Date | mutável (admin) |
| `expectedMatchCount` | number | **fixo** via `STAGE_EXPECTED_MATCHES` |

`StagePayload` adiciona derivados: `state`, `importedMatchCount`, `finishedMatchCount`. `StageReadinessItem` estende com `predecessor?: { code, state }`.

As 7 fases: `GROUP_STAGE`(1) → `LAST_32`(2) → `LAST_16`(3) → `QUARTER_FINALS`(4) → `SEMI_FINALS`(5) → `THIRD_PLACE`(6) → `FINAL`(7).

## 4. Estado derivado — `getStageState(stage, all, now)`

```
CLOSED  ⇐ now >= deadline
LOCKED  ⇐ existe predecessora E now < predecessora.deadline
OPEN    ⇐ caso contrário
```

Predecessora vem de `STAGE_PREDECESSOR` (não "anterior por ordem"). Exceção: `FINAL` e `THIRD_PLACE` têm ambas `SEMI_FINALS` como predecessora → podem coexistir em `OPEN`.

## 5. Requisitos funcionais

- **RF-STAGE-1** — Seed idempotente no boot (`onModuleInit`): se a coleção estiver vazia, insere as 7 fases a partir de `STAGE_ORDER`/`STAGE_DEADLINES`/`STAGE_EXPECTED_MATCHES`.
- **RF-STAGE-2** — `GET /api/stage` retorna `StagePayload[]` ordenado por `order`, com `state` derivado e contadores via aggregate.
- **RF-STAGE-3** — `GET /api/stage/readiness` (admin) acrescenta o estado da predecessora para diagnóstico.
- **RF-STAGE-4** — `PATCH /api/stage/:code` (admin) atualiza apenas `deadline` (`UpdateStageDto { deadline?: @IsDateString }`).

## 6. Regras de negócio

- **RN-STAGE-1** — Não existe "abrir/fechar manual": o estado é função pura de `deadline` + `now` + predecessora, recomputado a cada request.
- **RN-STAGE-2** — `expectedMatchCount` não é editável; vem do enum (Copa 2026, 48 seleções: 72/16/8/4/2/1/1).
- **RN-STAGE-3** — `importedMatchCount` = `count` de `Match` na fase; `finishedMatchCount` = `count` com `status: FINISHED` (alimenta a barra de progresso).
- **RN-STAGE-4** — Palpites só são aceitos quando a fase está `OPEN` (ver [bet](./bet.spec.md)).

## 7. Casos de borda e erros

- **CB-STAGE-1** — `PATCH` em `code` inexistente → `404`.
- **CB-STAGE-2** — Fase sem predecessora (`GROUP_STAGE`) nunca fica `LOCKED`.
- **CB-STAGE-3** — Adiantar `deadline` para o passado fecha a fase imediatamente e (por derivação) destrava a sucessora.

## 8. Dependências

- [match](./match.spec.md) (contadores via aggregate), [bet](./bet.spec.md) (gate `OPEN`), `@bolao/shared` (`stage-state.ts`).
