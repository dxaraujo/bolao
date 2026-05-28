# Especificação — Seleções (`team`)

- **ID:** SPEC-TEAM
- **Backend:** `backend/src/team/` (`team.controller.ts`, `team.service.ts`, `schemas/team.schema.ts`)
- **Shared:** `TeamPayload` (`dto.ts`), `tlaToFlagEmoji` (`flag-emoji.ts`)
- **Doc narrativa:** [`docs/arquitetura.md`](../docs/arquitetura.md) (diretório estático, download)

## 1. Objetivo

Importar e armazenar as seleções da Copa a partir da Football Data API, preferindo emoji de bandeira ao escudo baixado.

## 2. Atores e permissões

| Rota | Auth |
|---|---|
| `GET /api/team` | JWT |
| `POST /api/team/import` | Admin |

Também importado automaticamente pelo `Sistema` no bootstrap (ver [sync](./sync.spec.md)).

## 3. Modelo de dados — `Team` (timestamps)

| Campo | Tipo | Regra |
|---|---|---|
| `footballDataId` | number | **único** (índice explícito) |
| `name`, `shortName`, `tla` | string | obrigatórios |
| `flagEmoji` | string? | **preferencial** — derivado do TLA |
| `crest` | string? | fallback — path local `/static/teams/<TLA>.png` |
| `externalLastUpdated` | Date | obrigatório |

`TeamPayload` = `{ _id, name, shortName, tla, flagEmoji?, crest? }`.

## 4. Requisitos funcionais

- **RF-TEAM-1** — `GET /api/team` lista todas as seleções.
- **RF-TEAM-2** — `POST /api/team/import` busca `GET {API}/competitions/WC/teams?season=2026` e faz upsert por `footballDataId`.
- **RF-TEAM-3** — Para cada time: resolve `flagEmoji` via `tlaToFlagEmoji(tla)`; se houver emoji, usa-o; senão baixa o escudo para `crest`.

## 5. Regras de negócio

- **RN-TEAM-1** — `flagEmoji` tem precedência sobre `crest` em toda renderização (frontend `TeamCrest`).
- **RN-TEAM-2** — `tlaToFlagEmoji` mapeia alpha-3 → alpha-2 (tabela em `flag-emoji.ts`) e compõe via regional indicators; retorna `null` para TLA desconhecido (→ usa `crest`).
- **RN-TEAM-3** — Import é idempotente: só escreve quando o externo difere do local.
- **RN-TEAM-4** — Auto-correção no boot (`onModuleInit` → `syncMissingCrests`): re-baixa escudos faltando no disco.

## 6. Casos de borda e erros

- **CB-TEAM-1** — TLA fora da tabela alpha-3 → sem emoji; depende do `crest`.
- **CB-TEAM-2** — Download de escudo falha → `crest` pode ficar ausente; render cai para placeholder.
- **CB-TEAM-3** — API externa fora do ar → import loga warning, estado local inalterado.

## 7. Dependências

- `media` (download de escudo), [sync](./sync.spec.md) (import no bootstrap), referenciado por [match](./match.spec.md) (FKs `homeTeam`/`awayTeam`).
