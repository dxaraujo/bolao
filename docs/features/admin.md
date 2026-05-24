# Painel Admin

Tela administrativa para operadores do bolão.

- **Rota:** `/admin`
- **Componente:** `frontend/src/features/admin/AdminScreen.tsx`
- **Acesso:** requer `isAdmin: true` no JWT (guarda `AdminRoute` no frontend + `AdminGuard` em cada endpoint)

A tela é dividida em três seções: **Importações**, **Gerenciar Fases** e **Gerenciar Usuários**.

---

## 1. Importações

Três ações que disparam endpoints administrativos. Cada uma exibe um Card com ícone, título, descrição e botão **Executar** que vira `Loader2` durante a chamada. Toasts (`sonner`) confirmam sucesso ou falha.

### Importar Times

- **Endpoint:** `POST /api/team/import`
- **Backend:** `TeamService.importTeams` — busca `/competitions/WC/teams?season=2026` na Football Data API
- **Efeitos:**
  - Cria times ausentes
  - Atualiza times com `lastUpdated` mais recente
  - Baixa o escudo para `/static/teams/<TLA>.png` quando muda
  - Re-baixa escudos cujos arquivos sumiram do disco
- **Pré-requisito:** primeira execução, antes de importar partidas

### Importar Partidas

- **Endpoint:** `POST /api/match/import`
- **Backend:** `MatchService.importMatches` — busca `/competitions/WC/matches?season=2026`
- **Efeitos:**
  - Cria ou atualiza cada partida por `footballDataId`
  - Marca `valid: true` se ambos os times existem localmente; `false` se algum é TBD
  - Ignora partidas com `lastUpdated` não mais recente que o local
- **Pré-requisito:** Times já importados (fica `valid: false` para todos enquanto os times estão ausentes)

### Atualizar Resultados

- **Endpoint:** `POST /api/match/update-scores`
- **Backend:** `ScoreService.updateScores` (mesmo fluxo da cron `UpdateScoresTask`)
- **Efeitos:**
  - Para cada partida com `utcDate` no passado: compara placar/status com o registro local
  - Atualiza partidas com mudança
  - Empilha `_id`s alterados e chama `ResultService.updateResults`, que recalcula palpites + ranking
  - Marca `Config.lastUpdateResults` com `new Date()`

---

## 2. Gerenciar Fases

Lista todas as 7 fases com seu status, deadline e botão de transição.

### Workflow exibido

A tela mostra de cara o caminho canônico:

```
1. Grupos → 2. 32-avos → 3. Oitavas → 4. Quartas → 5. Semis → 6. 3º lugar → 7. Final
```

Com a nota:
> Cada fase só pode ser aberta quando a anterior estiver **encerrada**.
> Exceção: 3º lugar e Final dependem ambas de Semis e podem ficar abertas em paralelo.

### Cada linha (`StageRow`)

Cabeçalho com:
- Número da ordem (`1`–`7`)
- Ícone do status (`Lock` para `DISABLED`, `Play` para `OPEN`, `CheckCircle2` para `BLOCKED`)
- Nome amigável da fase (PT-BR, via `STAGE_LABELS`)
- Subtítulo: identificador técnico + posição `X/7`
- Badge de status: **Em breve** / **Aberto** / **Encerrado** (tom cinza/verde/vermelho)

Se `deadline` existe, exibe `Prazo: DD/MM HH:mm` formatado em PT-BR.

Se a fase é `DISABLED` e ainda aguarda a anterior:
> *Aguardando <fase anterior> ser encerrada*

### Botão de avanço

Mostrado apenas quando há transição possível:

| Status atual | Próximo status | Texto do botão     | Pré-requisito                                       |
|--------------|----------------|--------------------|-----------------------------------------------------|
| `DISABLED`   | `OPEN`         | **Abrir apostas**  | Fase anterior `BLOCKED` (ou `SEMI_FINALS` para `FINAL`) |
| `OPEN`       | `BLOCKED`      | **Encerrar fase**  | —                                                   |
| `BLOCKED`    | —              | (botão oculto)     | —                                                   |

O botão fica desabilitado se o pré-requisito não está satisfeito (linha de "Aguardando…" aparece).

### O que acontece ao clicar

`useAdvanceStage` → `PUT /api/stage/:matchStage { status }`. Backend (`StageService.update`):

1. Valida transição sequencial (qualquer outra transição → `400`)
2. Para `→ OPEN`:
   - Reimporta partidas para garantir times TBD resolvidos
   - Aborta com `400` se a fase ainda tem partidas `valid: false`
   - Aborta com `400` se o requisito da fase anterior não está satisfeito
3. Persiste o novo `status`
4. Para `→ OPEN`, dispara `seedBetsForStage` → cria palpites em branco para todos os usuários ativos (idempotente via upsert)

### Bloqueio automático paralelo

Mesmo enquanto o admin não toca em nada, a cron `BlockStagesTask` (cada minuto) varre fases `OPEN` cujo `deadline` já passou e as move para `BLOCKED`. Detalhes em [gestao-fases.md](./gestao-fases.md).

---

## 3. Gerenciar Usuários

Lista todos os usuários cadastrados (ativos e inativos), ordenados por:

1. `isActive` desc (ativos primeiro)
2. `name` (PT-BR locale)

### Cada cartão (`UserRow`)

- Avatar (foto do Google ou iniciais)
- Nome + escudo dourado (`Shield` icon) se `isAdmin: true`
- E-mail
- Badge: **Ativo** (verde) / **Inativo** (cinza)
- Dois botões:
  - **Ativar** / **Desativar** (`UserCheck` / `UserX`)
  - **Tornar admin** / **Remover admin** (`Shield` / `ShieldOff`)

### Endpoints

Ambos usam `useUpdateUser` → `PUT /api/user/:id`.

#### Ativar / Desativar

`{ isActive: true }` ou `{ isActive: false }`.

Efeitos colaterais no backend (`UserService.update`):
- `false → true`: chama `seedBetsForUser`, criando palpites em branco para todas as partidas das fases já `OPEN` ou `BLOCKED`
- `true → false`: chama `removeBetsForUser`, apagando todos os palpites do usuário

#### Tornar admin / Remover admin

`{ isAdmin: true }` ou `{ isAdmin: false }`.

> Note: o flag `isAdmin` é carregado no JWT no momento do **login**. Se você promover um usuário, ele só verá o Painel Admin **após relogar**. O backend, porém, valida o `AdminGuard` a partir do JWT atual — se o admin for rebaixado, o token antigo dele continua válido para rotas admin até expirar (não há blocklist).

---

## Dados consumidos

| Hook              | Endpoint                            | Uso                       |
|-------------------|-------------------------------------|---------------------------|
| `useAdminStages`  | `GET /api/stage` (admin)            | Listar todas as fases     |
| `useAdminUsers`   | `GET /api/user` (admin)             | Listar todos os usuários  |
| `useAdvanceStage` | `PUT /api/stage/:matchStage`        | Avançar status            |
| `useUpdateUser`   | `PUT /api/user/:id`                 | Ativar/desativar/admin    |
| `useImportTeams`  | `POST /api/team/import`             | Botão Importar Times      |
| `useImportMatches`| `POST /api/match/import`            | Botão Importar Partidas   |
| `useUpdateScores` | `POST /api/match/update-scores`     | Botão Atualizar Resultados|

Todos os hooks estão em `frontend/src/hooks/useAdmin.ts`.

## Estados

- **Carregando:** `Skeleton`s para cada seção enquanto suas queries não retornaram.
- **Sem fases:** card vazio com mensagem *"Nenhuma fase cadastrada. Rode 'Importar Partidas' primeiro."* (cenário raro — o seed inicial roda no boot).
- **Sem usuários:** card vazio *"Nenhum usuário cadastrado."*.

## Casos de borda

- **Tentativa de pular fase:** `400 Mudança de status inválida: X → Y`.
- **Tentativa de abrir fase com partidas inválidas:** `400 Não é possível abrir a fase X: N partida(s) sem times definidos.`
- **Tentativa de abrir fase com a anterior ainda não encerrada:** `400 Não é possível abrir a fase X: a fase anterior (Y) ainda não foi encerrada.`
- **Bloquear uma fase que já foi auto-bloqueada pela cron:** retorna `400` (já está em `BLOCKED`, a transição `BLOCKED → BLOCKED` não é válida).
