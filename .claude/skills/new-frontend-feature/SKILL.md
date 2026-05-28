---
name: new-frontend-feature
description: Cria uma nova feature no frontend (tela em features/, hook de dados em hooks/, rota no router.tsx) seguindo o padrão React 19 + TanStack Query do bolão. Use ao adicionar uma nova tela/área da UI.
---

# new-frontend-feature — scaffold de feature no frontend

Replica o padrão de `frontend/src/features/` (referência: `bets/`).

## Pergunte/decida antes

- Nome da feature (kebab no diretório `features/<nome>/`).
- Caminho da rota (em PT-BR, ex.: `apostas`, `ranking`) e label no `BottomNav`/`Header`.
- Precisa de guard? `ProtectedRoute` (logado), `ActiveRoute` (participante pagante), `AdminRoute`, `PublicOnlyRoute`.
- Endpoints que consome.

## Estrutura

```
frontend/src/features/<nome>/
  <Nome>Screen.tsx          # componente de tela (export nomeado)
  components/                # subcomponentes da feature
frontend/src/hooks/use<Nome>.ts   # data layer com TanStack Query
```

## Convenções (do código existente)

- **Hook de dados** em `hooks/use<Nome>.ts`: use `useQuery`/`useMutation` do `@tanstack/react-query`, `api.get/put/...` de `@/lib/api` (passe `signal`), `queryKey` em array, e tipos de `@bolao/shared`. Mutations invalidam as query keys afetadas no `onSuccess`.
- **Tela**: export nomeado `function <Nome>Screen()`. Componha primitives de `@/components/ui` e shared de `@/components/shared` (`TeamCrest`, `EmptyState`, `LiveDot`, `StageBadge`).
- **Rota**: adicione em `frontend/src/router.tsx` dentro do layout autenticado, envolvendo com o guard apropriado. Importe o `Screen` no topo (ordem dos imports já existente).
- **Navegação**: se a feature tem entrada no menu, ajuste `components/layout/BottomNav` / `Header`. Lembre: aba Apostas some se `!isActive`.
- **Terminologia PT-BR** na UI: palpite, partida, fase, ranking. Identificadores técnicos em inglês.
- **Tipos de fronteira** vêm de `@bolao/shared` — sem `any`.

## Verificação

Ao terminar, rode a skill `check` (ou `pnpm --filter ./frontend typecheck`).

## Antes de codar

Confira a spec `.spec/frontend.spec.md` para padrões de UI e estados (loading/empty/espectador).
