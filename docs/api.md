# API REST (v2)

API NestJS exposta pelo backend. Documentação OpenAPI navegável em `http://localhost:3000/api/docs` quando `NODE_ENV !== 'production'`.

## Convenções

- **Base URL:** `http://localhost:3000` em dev
- **Envelope sucesso:** `{ data: T }`
- **Envelope erro:** `{ errors, statusCode, path, timestamp, requestId? }` (`ApiErrorBody`)
- **Autenticação:** JWT no header `Authorization: Bearer <token>`
- Toda rota exige JWT por default (`JwtAuthGuard` global). Públicas usam `@Public()`. Admin adiciona `AdminGuard`. Palpite usa `ActiveParticipantGuard`.

## Endpoints

### Saúde / Auth

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/healthcheck` | público | |
| POST | `/auth/google` | público | Body `{ credential }` → `{ token }` |

JWT claims: `{ _id, email, name, avatar?, isAdmin, isActive }`.

### Usuário

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/user/me` | JWT | UserPayload |
| GET | `/api/user/active` | JWT | apenas `isActive: true` |
| GET | `/api/user` | admin | todos |
| PATCH | `/api/user/:id` | admin | `{ isActive?, isAdmin? }`. Dispara rebuild se `isActive` muda. **Sem side-effects em Bet.** |

### Times

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/team` | JWT | lista todos |
| POST | `/api/team/import` | admin | sincroniza com Football Data |

### Fases

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/stage` | JWT | `StagePayload[]` com estado derivado (`LOCKED`/`OPEN`/`CLOSED`) + `importedMatchCount` |
| GET | `/api/stage/readiness` | admin | `StageReadinessItem[]` para diagnóstico |
| PATCH | `/api/stage/:code` | admin | `{ deadline?, expectedMatchCount? }` |

Sem `PUT` para "abrir/fechar" — estado é derivado.

### Partidas

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/match` | JWT | `MatchPayload[]` com `stageState` embutido |
| POST | `/api/match/import` | admin | Reimporta calendário (TBD skipadas) |
| POST | `/api/match/sync-scores` | admin | Atualiza placares + rebuild leaderboard |

### Palpites

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/bet` | JWT | `MyBetItem[]` (partida + bet? + result?) |
| GET | `/api/bet/all` | JWT | `GroupedBetMatch[]` (fases CLOSED, left-join active users × bets) |
| PUT | `/api/bet` | **`ActiveParticipantGuard`** | Body `{ items: BetSubmitItem[] }`. Tudo-ou-nada. |

`BetSubmitItem`: `{ matchId: string, score: { home: number, away: number } | null }`.
- `score` preenchido → upsert
- `score: null` → delete
- Validação por item: integers `0..20`, partida existe, stage OPEN, status SCHEDULED

Códigos de erro: `400` validação, `403` espectador, `404` partida, `409` `MatchNotReady` / `StageNotOpen` / `MatchAlreadyStarted`.

### Leaderboard / Stats

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/leaderboard` | JWT | `LeaderboardPayload` (singleton) |
| GET | `/api/leaderboard/stats/overview` | JWT | `StatsOverview` |
| GET | `/api/leaderboard/stats/accuracy-by-user` | JWT | `UserAccuracy[]` |
| GET | `/api/leaderboard/stats/distribution` | JWT | `Distribution` |
| POST | `/api/leaderboard/rebuild` | admin | força recomputo |

### System state

| Método | Path | Auth | Notas |
|---|---|---|---|
| GET | `/api/system/state` | JWT | `SystemStatePayload` (timestamps + `scoringInProgress` derivado) |

## Recursos estáticos

- `/static/users/<id>.<ext>` — avatares
- `/static/teams/<TLA>.<ext>` — escudos (fallback; preferência é `flagEmoji`)

`Cache-Control: public, max-age=31536000, immutable`.
