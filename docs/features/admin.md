# Painel Admin

Tela administrativa para operadores do bolão.

- **Rota:** `/admin`
- **Componente:** `frontend/src/features/admin/AdminScreen.tsx`
- **Acesso:** requer `isAdmin: true` no JWT (guarda `AdminRoute` no frontend + `AdminGuard` em cada endpoint backend)

A tela é dividida em três seções: **Ações**, **Fases & Deadlines** (read-only) e **Usuários**.

---

## 1. Ações

Três tiles num único card (mobile 1 coluna, desktop 3 colunas) — cada tile dispara um endpoint admin com loading state no ícone e toast (`sonner`) de sucesso/erro.

### Importar Times

- **Endpoint:** `POST /api/team/import`
- **Backend:** `TeamService.importTeams` — busca `/competitions/WC/teams?season=2026`.
- **Efeitos:** cria/atualiza times; baixa escudos faltando para `static/teams/`. Usa `tlaToFlagEmoji` para preferir emoji a crest.
- **Pré-requisito:** primeira execução, antes de importar partidas.

### Importar Partidas & Placares

- **Endpoint:** `POST /api/match/import`
- **Backend:** `MatchService.importMatches` — busca `/competitions/WC/matches?season=2026`.
- **Efeitos:**
  - Upsert por `footballDataId`; partidas com algum time TBD são skipadas.
  - Mapeia status externo via `mapExternalStatus` (LIVE/FINISHED/SCHEDULED/CANCELLED).
  - Persiste `score` quando há, faz `$unset` quando o externo voltou a estado sem score.
  - Quando `changedIds.length > 0`: chama `LeaderboardService.rebuild()` + `systemState.leaderboardRebuilt()` + `systemState.matchImported()`.
- **Equivalente manual da cron `MatchSyncTask`.**

### Reconstruir Leaderboard

- **Endpoint:** `POST /api/leaderboard/rebuild`
- **Backend:** `LeaderboardService.rebuild()` — recomputa o singleton do zero a partir de bets × matches.
- **Quando usar:** suspeita de drift entre matches e leaderboard (ex.: após edição manual no banco).

---

## 2. Fases & Deadlines

**Read-only**. Timeline vertical com 7 nodes (um por fase), conectados por linha vertical, em um único card.

Cada linha (`StageRow`):

- **Node circular numerado** (1–7) à esquerda, cor pelo estado:
  - Verde (`OPEN`)
  - Acc (`CLOSED`)
  - Cinza (`LOCKED`)
- **Conteúdo direito:**
  - Nome amigável da fase (`STAGE_LABELS[code].full`) + badge de estado (`Aberta` / `Apostas Encerrada` / `Bloqueada`)
  - Linha de meta: ícone calendário + `formatDeadline(deadline)` à esquerda · contador `finishedMatchCount / expectedMatchCount` à direita
  - Barra de progresso com `width = (finishedMatchCount / expectedMatchCount) * 100%`, colorida pelo estado

Estado da fase é **derivado** por `getStageState({code, deadline}, all, now)` a cada request — não há "status" salvo no schema.

`expectedMatchCount` vem fixo do enum `STAGE_EXPECTED_MATCHES`; não é editável. `finishedMatchCount` vem do aggregate `MatchStatus.FINISHED` por stage.

**Não há botões nesta seção** (UI v2 é puramente informativa). Para forçar fechamento de fase em ambiente de simulação, há o endpoint público `GET /api/stage/advance-next/:code` — ver [sincronizacao-externa.md](./sincronizacao-externa.md).

---

## 3. Usuários

Lista todos os usuários cadastrados (ativos e inativos), ordenados por:

1. `isActive` desc (ativos primeiro)
2. `name` (PT-BR locale)

### Cada cartão (`UserRow`)

- Avatar (foto do Google ou iniciais)
- Nome + ícone `Shield` dourado se `isAdmin: true`
- E-mail
- Badge: **Ativo** (verde) / **Espectador** (cinza)
- Dois botões:
  - **Ativar** / **Desativar** (`UserCheck` / `UserX`)
  - **Tornar admin** / **Remover admin** (`Shield` / `ShieldOff`)

### Endpoint

Ambas as ações usam `useUpdateUser` → `PATCH /api/user/:id`.

#### Ativar / Desativar

`{ isActive: true }` ou `{ isActive: false }`.

Efeito colateral no backend (`UserService.update`):
- Quando `isActive` muda, atualiza `participationChangedAt` e dispara `LeaderboardService.rebuild()` (entrada/saída do ranking).
- **Não cria nem apaga bets** — bets são esparsos na v2.

#### Tornar admin / Remover admin

`{ isAdmin: true }` ou `{ isAdmin: false }`.

> O flag `isAdmin` é carregado no JWT no momento do **login**. Promoção só toma efeito após relogar. O backend valida via `AdminGuard` lendo do JWT — rebaixar admin não invalida tokens existentes até expirar.

---

## Hooks consumidos

| Hook                    | Endpoint                            | Uso                                  |
|-------------------------|-------------------------------------|--------------------------------------|
| `useAllStages`          | `GET /api/stage`                    | Listar todas as fases (timeline)     |
| `useAdminUsers`         | `GET /api/user`                     | Listar todos os usuários             |
| `useUpdateUser`         | `PATCH /api/user/:id`               | Ativar/desativar/promover            |
| `useImportTeams`        | `POST /api/team/import`             | Tile "Importar Times"                |
| `useImportMatches`      | `POST /api/match/import`            | Tile "Importar Partidas & Placares"  |
| `useRebuildLeaderboard` | `POST /api/leaderboard/rebuild`     | Tile "Reconstruir Leaderboard"       |

Todos em `frontend/src/hooks/useAdmin.ts`. O hook `useUpdateStage` ainda existe no código (`PATCH /api/stage/:code { deadline? }`) mas não é mais usado pela UI.

## Estados

- **Carregando:** `Skeleton` para a timeline de fases e cards de usuários.
- **Sem usuários:** card vazio *"Nenhum usuário cadastrado."*.

## Casos de borda

- **Tile "Importar Partidas" enquanto outro deploy roda o cron:** sem corrida — `importMatches` é idempotente e usa `findOneAndUpdate`.
- **Auto-bloqueio sem ação humana:** quando o `deadline` da fase atual passa, ela vira `CLOSED` na próxima request (estado derivado). Não há job dedicado.
