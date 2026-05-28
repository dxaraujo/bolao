---
name: new-backend-module
description: Cria um novo módulo NestJS seguindo o padrão do backend do bolão (controller/service/schema/dto, guards, registro no app.module). Use ao adicionar uma nova área de domínio no backend.
---

# new-backend-module — scaffold de módulo Nest

Replica o padrão dos módulos existentes em `backend/src/` (referência: `bet/`).

## Pergunte/decida antes

- Nome do módulo (kebab no diretório, PascalCase nas classes).
- Tem schema Mongoose próprio? (CRUD vs. só leitura/derivado)
- Rotas públicas (`@Public()`) ou protegidas? Restrição a participante ativo (`ActiveParticipantGuard`) ou admin?
- De quais módulos depende (importa nos `imports`)?

## Estrutura

```
backend/src/<nome>/
  <nome>.module.ts
  <nome>.controller.ts
  <nome>.service.ts
  schemas/<nome>.schema.ts      # se tiver persistência
  dto/                          # DTOs com class-validator (ou tipos de @bolao/shared)
```

## Convenções a seguir (do código existente)

- **Controller**: `@ApiTags('<nome>')`, `@Controller('api/<nome>')`. Use `@ApiProtectedInDocs()` em rotas protegidas. Injete o service como `private readonly service`. Respostas no formato `{ data }`.
- **Auth**: `JwtAuthGuard` é global — rotas protegidas não precisam declará-lo; rotas públicas usam `@Public()`. Para restringir, `@UseGuards(ActiveParticipantGuard)` (ou guard de admin). Usuário atual via `@CurrentUser() user: JwtPayload`.
- **Module**: registre o schema com `MongooseModule.forFeature([{ name: X.name, schema: XSchema }])`, importe módulos-dependência, exporte `Service` (e `MongooseModule` se outro módulo precisar do model).
- **Tipos de fronteira** (request/response) vêm de `@bolao/shared`, não duplicados.
- **Sem side-effects cruzados** silenciosos — siga a separação dos módulos atuais (ex.: `user` não mexe em `Bet`).

## Registro final

Adicione `<Nome>Module` aos `imports` de `backend/src/app.module.ts` (mantendo a ordem alfabética dos imports já usada).

## Verificação

Ao terminar, rode a skill `check` (ou ao menos `pnpm --filter ./backend typecheck && pnpm --filter ./backend lint`).

## Antes de codar

Leia a spec do domínio em `.spec/` se já existir contrato (requisitos RF/RN, modelo de dados, casos de borda).
