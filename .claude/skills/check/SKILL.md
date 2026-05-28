---
name: check
description: Roda typecheck e lint dos três workspaces (backend, frontend, shared) e reporta os resultados. Use antes de commitar ou após mudanças que cruzam workspaces.
---

# check — verificação rápida do monorepo

Rode da raiz do repositório. Pare e reporte no primeiro erro de cada etapa, mas execute todas as etapas (não aborte tudo no primeiro fail — o usuário quer o panorama).

## Passos

1. **Se mexeu no `shared/`**, rebuild o contrato primeiro (os outros workspaces consomem o build):
   ```
   pnpm build:shared
   ```

2. **Type-check** dos dois apps:
   ```
   pnpm --filter ./backend typecheck
   pnpm --filter ./frontend typecheck
   ```

3. **Lint**:
   ```
   pnpm --filter ./backend lint
   ```
   (Frontend lint só se houver script `lint` no `frontend/package.json`.)

## Reporte

Tabela curta: workspace × etapa × ✅/❌. Para cada ❌, cole só as linhas de erro relevantes (não o output inteiro). Se tudo passar, uma linha: "tudo verde".

Não conserte nada nesta skill — só verifica e reporta. Correções são tarefa separada.
