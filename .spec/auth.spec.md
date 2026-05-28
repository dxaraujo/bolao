# Especificação — Autenticação (`auth`)

- **ID:** SPEC-AUTH
- **Backend:** `backend/src/auth/` (`auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`), `backend/src/common/` (`public.decorator.ts`, `admin.guard.ts`, `active-participant.guard.ts`, `current-user.decorator.ts`)
- **Shared:** `AuthenticatedUser` (`dto.ts`)
- **Doc narrativa:** [`docs/dominio.md`](../docs/dominio.md) (fluxo "Login")

## 1. Objetivo

Autenticar usuários via Google Identity (ID token), materializar/atualizar o `User` local e emitir um JWT próprio que carrega as claims usadas pelos guards. Autorizar requests por padrão-fechado.

## 2. Atores e permissões

| Ator | Pode |
|---|---|
| Anônimo | `POST /auth/google`, `GET /healthcheck` |
| Autenticado (JWT válido) | qualquer rota não-admin/não-ativa |
| Admin | rotas com `AdminGuard` |
| Participante | rotas com `ActiveParticipantGuard` |

## 3. Contratos

### Entrada — `POST /auth/google` (`@Public`)

```ts
GoogleLoginDto { credential: string }   // ID token do Google, @IsString
```

### Saída

```ts
{ data: { token: string } }             // JWT assinado (HS256, AUTH_SECRET)
```

### JWT — `JwtPayload`

```ts
{ _id: string, email: string, name: string, avatar?: string, isAdmin: boolean, isActive: boolean }
```

Expira em `JWT_EXPIRES_IN` (default `30d`). `@CurrentUser()` injeta o payload decodificado.

## 4. Requisitos funcionais

- **RF-AUTH-1** — `POST /auth/google` verifica o ID token com `google-auth-library` (`verifyIdToken`, audience = `GOOGLE_CLIENT_ID`).
- **RF-AUTH-2** — Após verificar, faz upsert do `User` por `googleSub` (ver [user](./user.spec.md)) e retorna JWT assinado com as 6 claims acima.
- **RF-AUTH-3** — `JwtAuthGuard` é `APP_GUARD` global: toda rota exige `Authorization: Bearer <token>` salvo handlers/controllers com `@Public()`.
- **RF-AUTH-4** — `AdminGuard` exige `isAdmin: true` na claim; `ActiveParticipantGuard` exige `isActive: true`. Ambos rodam sobre o JWT global.

## 5. Regras de negócio

- **RN-AUTH-1** — O perfil Google é aceito apenas se o e-mail for autoritativo: `email.endsWith('@gmail.com')` **ou** `payload.hd` presente (Google Workspace) **ou** `email_verified === true`. Caso contrário → `401`.
- **RN-AUTH-2** — `sub`, `email` e `name` são obrigatórios no payload Google; ausência → `401 "Google token payload incompleto"`.
- **RN-AUTH-3** — `givenName` e `picture` são opcionais; `picture` ausente vira `''`.
- **RN-AUTH-4** — Guards de autorização confiam na claim do JWT, mas serviços sensíveis **revalidam contra o banco** (o JWT pode estar desatualizado se o admin alterou `isActive`/`isAdmin` após a emissão). Ver `BetService.submit`.

## 6. Casos de borda e erros

- **CB-AUTH-1** — Token inválido/expirado/assinatura incorreta → `401 "Falha ao verificar token do Google"`.
- **CB-AUTH-2** — JWT ausente em rota protegida → `401` (Passport).
- **CB-AUTH-3** — JWT válido mas espectador acessando rota `ActiveParticipantGuard` → `403`.
- **CB-AUTH-4** — JWT com `isActive: true` desatualizado (admin desativou): guard passa, mas `BetService.submit` recheca no banco e devolve `403`.

## 7. Dependências

- [user](./user.spec.md) — upsert no login.
- `GOOGLE_CLIENT_ID`, `AUTH_SECRET` (obrigatórias), `JWT_EXPIRES_IN` (opcional).
