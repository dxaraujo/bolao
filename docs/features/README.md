# Funcionalidades

Documentação detalhada de cada funcionalidade implementada do Bolão.

| Documento                                                        | Escopo                                                                 |
|------------------------------------------------------------------|------------------------------------------------------------------------|
| [Autenticação e sessão](./autenticacao.md)                       | Login com Google, emissão de JWT, ciclo de vida da sessão              |
| [Tela Início (HomeScreen)](./home.md)                            | `/` — posição do usuário, jogos ao vivo, próximos jogos, recentes      |
| [Apostas (BetsScreen)](./apostas.md)                             | `/apostas` — palpitar nas partidas das fases abertas                   |
| [Bolão — apostas do grupo (BolaoScreen)](./bolao.md)             | `/bolao` — visualização dos palpites de todos nas fases encerradas     |
| [Ranking](./ranking.md)                                          | `/ranking` — classificação geral + pódio + gráfico                     |
| [Estatísticas](./estatisticas.md)                                | `/stats` — KPIs, acerto por usuário, distribuição de resultados        |
| [Painel Admin](./admin.md)                                       | `/admin` — importações, gestão de fases, gestão de usuários            |
| [Gestão de fases (lifecycle)](./gestao-fases.md)                 | Backend — ciclo de vida de `Stage`, deadlines, bloqueio automático     |
| [Motor de pontuação](./pontuacao.md)                             | Backend — cálculo de `BetScore`, agregação por usuário, ranking        |
| [Sincronização com Football Data API](./sincronizacao-externa.md)| Backend — importações, cron de placares, fluxo de update               |

## Como ler

Cada documento de feature segue a estrutura:

1. **Visão geral** — o que é, para quem, onde está no código
2. **Comportamento** — como funciona do ponto de vista do usuário
3. **Implementação** — componentes/serviços envolvidos, contratos consumidos
4. **Casos especiais / borda** — comportamentos sutis que valem ser conhecidos
