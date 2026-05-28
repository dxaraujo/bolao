---
name: shared-contract
description: Alterar enums, DTOs ou funções puras no pacote @bolao/shared. Garante o rebuild e que os dois lados (backend e frontend) sejam ajustados juntos. Use sempre que mudar algo em shared/src.
---

# shared-contract — mudar o contrato compartilhado

`@bolao/shared` é a fonte única de verdade para tipos e lógica pura que cruzam frontend↔backend. Mudar aqui sem propagar quebra os dois apps.

## Onde fica o quê (`shared/src/`)

- `enums.ts` — `MatchStage`, `MatchStatus`, `StageState`
- `dto.ts` — DTOs trocados pela API
- `api.ts` — tipos de payload/resposta
- `scoring.ts` — `calculateBetScore`, `SCORING_RULES`
- `stage-state.ts` — `getStageState`, `STAGE_DEADLINES`, `STAGE_EXPECTED_MATCHES`
- `match-status.ts` — `mapExternalStatus`, `isCanonicalTransition`
- `flag-emoji.ts` — `tlaToFlagEmoji`
- `date.ts`, `index.ts` (barrel — exporte daqui)

## Regras

- **Funções puras** (score, estado de fase, de-para de status) vivem **só** aqui. Não reimplemente no backend nem no frontend — importe.
- **Não use `any`** na fronteira. Tipos cruzando apps vêm daqui.
- Exporte tudo novo pelo `index.ts`.

## Fluxo obrigatório

1. Edite o(s) arquivo(s) em `shared/src/`.
2. **Rebuild o contrato** — backend e frontend consomem o `dist`:
   ```
   pnpm build:shared
   ```
3. Ajuste **os dois consumidores** na mesma mudança:
   - Backend: services/controllers/schemas que usam o tipo/função.
   - Frontend: hooks (`hooks/`), libs (`lib/`), componentes de feature.
4. Type-check ambos (rode a skill `check` ou):
   ```
   pnpm --filter ./backend typecheck && pnpm --filter ./frontend typecheck
   ```

## Atenção

- Mudar um enum ou a forma de um DTO costuma quebrar pontuação ou leaderboard. Se tocou em `scoring.ts` ou `stage-state.ts`, considere acionar o agente `scoring-reviewer`.
- Se a regra mudou de comportamento, atualize a spec correspondente em `.spec/` (`scoring.spec.md`, `stage.spec.md`, etc.).
