# Documentação — Bolão da Copa 2026 (v2)

Documentação oficial do **Bolão da Copa 2026**, app privado para amigos e família apostarem nos jogos da Copa do Mundo FIFA 2026.

> v2 = refactor estrutural completo. Stack: NestJS 10 + Mongoose 8 (backend), React 19 + Vite + Tailwind + shadcn/ui (frontend), tipos compartilhados via `@bolao/shared`.

## Índice

### Visão geral

- [Arquitetura](./arquitetura.md) — monorepo, módulos, camadas, fluxo de dados
- [Domínio](./dominio.md) — entidades, ciclo de vida das fases, regras de pontuação
- [API REST](./api.md) — endpoints, contratos, autenticação
- [Desenvolvimento](./desenvolvimento.md) — setup, scripts, variáveis de ambiente
- [Plano v2](./v2-plan.md) — decisões e modelos da reescrita

### Funcionalidades

- [Autenticação e sessão](./features/autenticacao.md)
- [Tela Início (HomeScreen)](./features/home.md)
- [Apostas (BetsScreen)](./features/apostas.md)
- [Bolão (BolaoScreen)](./features/bolao.md)
- [Ranking](./features/ranking.md)
- [Estatísticas](./features/estatisticas.md)
- [Painel Admin](./features/admin.md)
- [Motor de pontuação](./features/pontuacao.md)
- [Sincronização externa](./features/sincronizacao-externa.md)

## O que mudou na v2

- **Modelos slim:** `User` sem contadores, `Bet` sem flags, `Match` sem `valid`, `Stage` sem `status`
- **Estado derivado:** `getStageState` em todo request, sem `BlockStagesTask`
- **Bets esparsos:** sem `seedBetsForX` — palpite só existe quando usuário cria
- **Leaderboard como view:** singleton recomputado quando há mudança
- **Espectador:** `isActive: false` vê tudo mas não palpita nem entra no ranking
- **Emoji de bandeira:** `Team.flagEmoji` preferencial sobre `crest`
- **Score subdoc:** `Match.score` e `Bet.score` como `{home, away}`
- **`MatchStatus` reduzido:** 4 valores internos, `mapExternalStatus` faz de-para
- **1 cron unificada:** `MatchSyncTask` (`*/5 * * * *`) + bootstrap na subida — import de times+partidas, sync de placares e rebuild de leaderboard no mesmo fluxo
- **Endpoints `@Public` de simulação:** `GET /api/match/advance-next[/:code]` e `GET /api/stage/advance-next/:code` para testes locais

## Convenções

- Idioma: PT-BR
- Identificadores técnicos em inglês (`User`, `Bet`, `Stage`, …)
- Endpoints com método HTTP + path (ex.: `PUT /api/bet`)
- Banco v2: `bolao_v2` (configurável via `MONGODB_URI`)
