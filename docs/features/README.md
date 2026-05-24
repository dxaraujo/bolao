# Funcionalidades

Documentação detalhada de cada funcionalidade do Bolão (v2).

| Documento | Escopo |
|---|---|
| [Autenticação e sessão](./autenticacao.md) | Login com Google, JWT, guards (`Active`/`Admin`) |
| [Tela Início (HomeScreen)](./home.md) | `/` — posição, banner de fase aberta, live, próximos, recentes |
| [Apostas (BetsScreen)](./apostas.md) | `/apostas` — palpitar; **rota `ActiveRoute`** (só participantes) |
| [Bolão (BolaoScreen)](./bolao.md) | `/bolao` — palpites de todos por partida, fases CLOSED |
| [Ranking](./ranking.md) | `/ranking` — pódio, lista, gráfico, tabela de pontuação |
| [Estatísticas](./estatisticas.md) | `/stats` — KPIs, accuracy, distribuição |
| [Painel Admin](./admin.md) | `/admin` — importações, fases (PATCH deadline), usuários, rebuild leaderboard |
| [Motor de pontuação](./pontuacao.md) | `calculateBetScore` + `LeaderboardService.rebuild()` |
| [Sincronização externa](./sincronizacao-externa.md) | Football Data, crons `MatchSyncTask` + `MatchImportTask` |

## Como ler

1. **Visão geral** — o que é, onde está no código
2. **Comportamento** — UX
3. **Implementação** — componentes/serviços, contratos
4. **Casos de borda** — comportamentos sutis

> Removida da v2: `gestao-fases.md` — estado de fase é derivado em tempo real, não há mais "abrir/fechar manual". Admin altera `deadline` via `PATCH /api/stage/:code`.
