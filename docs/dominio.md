# Domínio (v2)

Visão transversal do Bolão da Copa 2026: vocabulário, princípio norteador, fluxos que cruzam módulos e o conceito de espectador.

> O **modelo de dados detalhado** (campos, índices) e as **regras por módulo** ficam nas specs: [`.spec/`](../.spec/README.md). A **tabela de pontuação** está em [`.spec/scoring.spec.md`](../.spec/scoring.spec.md).

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

## Entidades (mapa)

As sete entidades e onde cada uma é especificada:

| Entidade | O que é | Spec |
|---|---|---|
| `User` | identidade + participação (`isActive`) | [user](../.spec/user.spec.md) |
| `Team` | seleção (bandeira preferencial sobre escudo) | [team](../.spec/team.spec.md) |
| `Stage` | fase com `deadline`; estado `LOCKED/OPEN/CLOSED` **derivado** | [stage](../.spec/stage.spec.md) |
| `Match` | partida (vem do provedor; status interno reduzido) | [match](../.spec/match.spec.md) |
| `Bet` | palpite esparso `{home, away}` | [bet](../.spec/bet.spec.md) |
| `Leaderboard` | view materializada (singleton) | [leaderboard](../.spec/leaderboard.spec.md) |
| `SystemState` | timestamps de sync (singleton) | [sync](../.spec/sync.spec.md) |

Pontuação (`calculateBetScore`, desempate): [scoring](../.spec/scoring.spec.md). **LIVE pontua** — o ranking atualiza em tempo real.

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

### 4. Mudança de estado da fase

**Não há "abrir/fechar manual"** — estado é derivado em todo request. Admin pode ajustar `deadline` via `PATCH /api/stage/:code { deadline }`.

### 5. Ativar/desativar usuário

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
