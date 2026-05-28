# Especificações do sistema — Bolão da Copa 2026

Specs formais por módulo do sistema. Cada arquivo descreve **o quê** o módulo garante (requisitos, contratos, regras, casos de borda) de forma verificável contra o código.

> Diferença para `docs/`: `docs/` é documentação narrativa (como funciona, por quê); `.spec/` é a especificação formal (o contrato que o código deve cumprir). Quando divergirem, o **código é a fonte de verdade** — atualize a spec.

## Convenções

- **IDs:** `RF-<MOD>-<n>` requisito funcional · `RN-<MOD>-<n>` regra de negócio · `CB-<MOD>-<n>` caso de borda.
- **Atores:** `Espectador` (`isActive: false`), `Participante` (`isActive: true`), `Admin` (`isAdmin: true`), `Sistema` (crons/bootstrap), `Provedor` (Football Data API).
- **Envelope HTTP:** sucesso `{ data: T }`; erro `{ errors, statusCode, path, timestamp, requestId? }`.
- **Auth:** `JwtAuthGuard` global — toda rota exige JWT salvo as marcadas `@Public()`.

## Índice

| Spec | Módulo | Escopo |
|---|---|---|
| [auth](./auth.spec.md) | `auth` | Login Google → JWT, guards, rotas públicas |
| [user](./user.spec.md) | `user` | Identidade, participação (ativo/espectador), admin, avatar |
| [team](./team.spec.md) | `team` | Seleções, import, bandeira preferencial sobre escudo |
| [stage](./stage.spec.md) | `stage` | Fases, estado derivado `LOCKED/OPEN/CLOSED`, seed, deadline |
| [match](./match.spec.md) | `match` | Partidas, import, status interno, transições |
| [bet](./bet.spec.md) | `bet` | Palpites esparsos, submit tudo-ou-nada, visão de grupo |
| [scoring](./scoring.spec.md) | `@bolao/shared` | `calculateBetScore`, desempate, função pura |
| [leaderboard](./leaderboard.spec.md) | `leaderboard` | Ranking singleton + estatísticas derivadas |
| [sync](./sync.spec.md) | `schedule` + `system-state` | Cron unificada, Football Data, timestamps de sync |
| [frontend](./frontend.spec.md) | `frontend` | Rotas, guards, telas, watch de resultados, PWA |

## Mapa de contratos compartilhados

Todo tipo que cruza a fronteira frontend↔backend vive em `@bolao/shared` (`shared/src/`). As specs referenciam esses símbolos pelo nome; a definição canônica está em `dto.ts`, `enums.ts`, `scoring.ts`, `stage-state.ts`, `match-status.ts`, `flag-emoji.ts`, `api.ts`, `date.ts`.
