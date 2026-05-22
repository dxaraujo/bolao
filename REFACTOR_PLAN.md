# Plano — Reescrita do Frontend (Copabet)

Reescrita do `frontend/` a partir do mockup `frontend/copabet-app.jsx`, em
**React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui + Recharts**.

## Visão de produto

Mobile-first (PWA), max-width 430px no shell, dark/light theme. Seis telas:

| # | Tela     | Rota         | Resumo |
|---|----------|--------------|--------|
| 1 | Login    | `/login`     | Google Sign-In único |
| 2 | Jogos    | `/`          | Hero (sua posição), fase aberta CTA, próximos jogos + ao vivo + encerrados |
| 3 | Apostas  | `/apostas`   | Tabs por fase, inputs de placar, salvar em lote, badge por status |
| 4 | Bolão    | `/bolao`     | Tabs por fase encerrada, accordion por jogo, todos os palpites do grupo |
| 5 | Ranking  | `/ranking`   | Pódio, lista completa, bar chart pts x exatos |
| 6 | Stats    | `/stats`     | KPIs, accuracy por jogador, linha por fase, donut de distribuição |

## Stack frontend

| Camada         | Escolha                                       |
|----------------|-----------------------------------------------|
| Bundler        | Vite 7                                        |
| Lib            | React 19                                      |
| Tipos          | TypeScript 5.7                                |
| Estilo         | Tailwind CSS v4 (config em CSS, `@theme`)     |
| UI primitives  | shadcn/ui (Radix)                             |
| Roteamento     | React Router v7 (modo `data` / `createBrowserRouter`) |
| Estado server  | TanStack Query v5                             |
| HTTP           | `fetch` + wrapper com JWT                     |
| Auth Google    | `@react-oauth/google` (One Tap + Button)      |
| Charts         | Recharts                                      |
| Fontes         | Bebas Neue + Outfit (Google Fonts)            |
| PWA            | `vite-plugin-pwa` (workbox)                   |
| Toasts         | `sonner`                                      |
| Datas          | `date-fns` v4                                 |
| Ícones         | `lucide-react`                                |

## Tokens de tema (CSS vars + Tailwind v4 `@theme`)

Replicam o mapa `DARK`/`LIGHT` do mockup, expostos como CSS variables:

```css
:root {
  --bg: 238 243 249;          /* light */
  --surface: 255 255 255;
  --border: 202 216 236;
  --text: 10 21 36;
  --acc: 0 119 182;
  --gold: 194 120 0;
  --green: 22 163 74;
  --red: 220 38 38;
  --purple: 124 58 237;
}
.dark {
  --bg: 7 13 24;
  --surface: 17 29 46;
  /* … */
}
```

E `@theme inline` do Tailwind v4 expõe `bg-acc`, `text-gold`, `border-border` etc.

---

## Gaps no backend (rotas novas necessárias)

O backend cobre **CRUD básico + meus palpites**. O mockup precisa de:
- Palpites de **todos os usuários** por partida (tela Bolão)
- **Stats agregadas** (tela Stats)
- **Deadline por fase** (banner "fecha em X" da tela Jogos/Apostas)
- **Configuração de pontuação** legível pela UI (tela Ranking → tabela de pontos)

### 1. `Stage` — adicionar `deadline`

```ts
// backend/src/stage/schemas/stage.schema.ts
@Prop({ required: false }) deadline?: Date;
```

DTO `UpdateStageDto` ganha `deadline?: string` (ISO). `GET /api/stage/visible`
passa a retornar `{ matchStage, status, deadline }`.

### 2. `GET /api/bet/by-match/:matchId` (todos os palpites de um jogo)

- **Auth**: usuário comum
- **Quando**: o `Stage` da partida é `BLOCKED`
- **Resposta**:

```ts
type BetByMatchItem = {
  user: { _id: string; name: string; picture: string };
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  result: 'exact' | 'winnerWithGoal' | 'correctWinner' | 'oneGoalCorrect' | 'wrong' | 'pending';
  pointsEarned: 0 | 1 | 2 | 3 | 5;
};
// ApiResponse<BetByMatchItem[]>
```

Se a fase ainda não estiver BLOCKED → `403 Forbidden`.

### 3. `GET /api/stats/overview`

KPIs do bolão inteiro:

```ts
type StatsOverview = {
  totalMatches: number;        // partidas com status FINISHED
  totalExactBets: number;      // soma de exactScore=true entre todas as apostas
  totalCorrectBets: number;    // soma de correctWinner=true
  leader: { _id: string; name: string; picture: string; points: number };
};
```

### 4. `GET /api/stats/accuracy-by-stage`

Para o line chart "evolução por fase":

```ts
type StageAccuracy = {
  matchStage: MatchStage;
  shortName: string;           // "Grupos", "Oitavas" — derivado server-side
  users: Array<{
    _id: string;
    name: string;
    accuracyPct: number;       // (exact*5 + correct*2 + …) / max
  }>;
};
// ApiResponse<StageAccuracy[]>
```

### 5. `GET /api/stats/distribution`

Donut da tela Stats:

```ts
type Distribution = {
  exact: { count: number; pct: number };
  correctWinner: { count: number; pct: number };
  wrong: { count: number; pct: number };
};
```

### 6. `GET /api/config` — expor pontuação

`Config` atualmente só tem `updatingScores`. Adicionar:

```ts
@Prop({ default: 5 }) pointsExact!: number;
@Prop({ default: 3 }) pointsWinnerWithGoal!: number;
@Prop({ default: 2 }) pointsOneGoalCorrect!: number;
@Prop({ default: 1 }) pointsCorrectWinner!: number;
```

(O backend já calcula via `score.service.ts` — só precisamos espelhar como
documento para a UI consumir.)

### 7. `GET /api/match/visible` — enriquecer

A UI pede agrupar por status (`upcoming`/`live`/`finished`). Já dá pra fazer
no cliente, mas é útil expor um helper:

- `GET /api/match/visible?status=upcoming|live|finished` (filtro server-side)

Opcional — pode ficar como fase 2.

---

## Roadmap de execução

Cada fase é um PR autocontido.

### F1 — Backend: rotas e schemas novos
1. Estender `Stage` com `deadline` + DTO + endpoint
2. Estender `Config` com campos de pontuação + seed
3. Adicionar `BetController.getByMatch(matchId)` + service
4. Criar módulo `stats/` com 3 endpoints (overview, accuracy-by-stage, distribution)

### F2 — `@bolao/shared`: contratos novos
DTOs/tipos para tudo da F1 (`BetByMatchItem`, `StatsOverview`, etc.) + helpers
puros: `betResult()`, `resultLabel()`, `resultPoints()`.

### F3 — Frontend scaffold
- `package.json`, Vite, TS, Tailwind v4, shadcn `components.json`
- Tokens de tema (CSS vars + `@theme`)
- App shell (header + bottom nav + max-w-[430px])
- Theme provider (dark/light + localStorage)
- API client + interceptors (auth + erro)
- TanStack Query provider
- AuthProvider (Google) + ProtectedRoute
- Router (React Router v7)

### F4 — Telas (porta direta do `copabet-app.jsx`)
- F4a — `LoginScreen`
- F4b — `HomeScreen` (`/`)
- F4c — `BetsScreen` (`/apostas`)
- F4d — `BolaoScreen` (`/bolao`)
- F4e — `RankingScreen` (`/ranking`)
- F4f — `StatsScreen` (`/stats`)

### F5 — Polish
- PWA + manifest
- Loading skeletons
- Empty states
- Toasts em mutations
- Animações (anim-up/anim-fade do mockup)

### F6 — Limpeza
- Remover `copabet-app.jsx` quando todas as telas estiverem migradas
- Atualizar `frontend/README.md` com a stack final
- Atualizar `docker-compose.yml` para subir o frontend também

---

## Notas de implementação

- **Bandeirinhas**: no mockup são emojis. O backend tem `Team.crest` (URL SVG da
  Football Data API). Usar a URL real; emoji como fallback opcional via mapa
  TLA→emoji para PWA offline.
- **Pontuação no UI**: o backend dá 5 valores (exact, winnerWithGoal,
  oneGoalCorrect, correctWinner, wrong). A UI do mockup simplifica em 3
  (exact/correct/wrong). Vou exibir os 5 níveis reais no `Bolão` e `Ranking`,
  mas manter agrupamento `exact / correct / wrong` em widgets de visão rápida
  (Home hero, badges) para não poluir.
- **Sem mock data**: tudo via TanStack Query → API. Em dev, MSW pode ser
  adicionado depois se necessário.
