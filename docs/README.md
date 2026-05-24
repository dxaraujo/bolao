# Documentação — Bolão da Copa 2026

Documentação oficial da aplicação **Bolão da Copa 2026**, um app privado para amigos e família apostarem nos jogos da Copa do Mundo FIFA 2026.

> Esta documentação reflete o estado atual da implementação. Stack atual: NestJS 10 + Mongoose 8 no backend, React 19 + Vite + Tailwind + shadcn/ui no frontend, com tipos compartilhados via `@bolao/shared`.

## Índice

### Visão geral

- [Arquitetura](./arquitetura.md) — monorepo, módulos, camadas, fluxo de dados
- [Domínio](./dominio.md) — entidades, ciclo de vida das fases, regras de pontuação
- [API REST](./api.md) — endpoints, contratos, autenticação
- [Desenvolvimento](./desenvolvimento.md) — setup, scripts, variáveis de ambiente, debugging

### Funcionalidades

Cada funcionalidade implementada tem documentação dedicada em [`./features/`](./features/README.md):

- [Autenticação e sessão](./features/autenticacao.md)
- [Tela Início (HomeScreen)](./features/home.md)
- [Apostas (BetsScreen)](./features/apostas.md)
- [Bolão — apostas do grupo (BolaoScreen)](./features/bolao.md)
- [Ranking](./features/ranking.md)
- [Estatísticas](./features/estatisticas.md)
- [Painel Admin](./features/admin.md)
- [Gestão de fases (lifecycle)](./features/gestao-fases.md)
- [Motor de pontuação](./features/pontuacao.md)
- [Sincronização com Football Data API](./features/sincronizacao-externa.md)

## Convenções desta documentação

- Idioma: **português brasileiro**.
- Terminologia do domínio em PT-BR (palpite, partida, fase, grupo, pontuação) — exceto identificadores técnicos (módulos, classes, propriedades), que seguem o código em inglês.
- Referências a arquivos sempre como caminho relativo à raiz do repositório (`backend/src/...`, `frontend/src/...`).
- Endpoints sempre com método HTTP + path completo (`POST /auth/google`, `GET /api/bet`).
