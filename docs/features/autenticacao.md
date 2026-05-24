# Autenticação e sessão

Login exclusivo via **Google Identity Services** com emissão de **JWT** próprio.

## Visão geral

- **Provedor de identidade:** Google OAuth (Identity Services)
- **Estratégia da API:** JWT assinado pelo backend, anexado a cada requisição como `Authorization: Bearer <token>`
- **Tela:** `frontend/src/features/auth/LoginScreen.tsx`
- **Guarda do roteador:** `frontend/src/components/guards/ProtectedRoute.tsx` (`ProtectedRoute`, `PublicOnlyRoute`, `AdminRoute`)
- **Backend:** módulo `auth` (`backend/src/auth/`)

## Fluxo de login

1. Usuário acessa `/login` (a única rota com `PublicOnlyRoute`).
2. O botão "Entrar com Google" usa `@react-oauth/google` e retorna um **ID Token** assinado pelo Google.
3. Frontend envia `POST /auth/google { credential: <id-token> }`.
4. Backend (`AuthService.loginWithGoogle`):
   - Cria `OAuth2Client(GOOGLE_CLIENT_ID)` e chama `verifyIdToken({ idToken, audience })`
   - Extrai `sub`, `email`, `name`, `picture` do payload
   - Recusa se faltar campo obrigatório → `401 Google token payload incompleto`
   - Recusa se `email` não for `@gmail.com` **e** não houver `hd` (Google Workspace) **e** `email_verified !== true` → `401 E-mail do Google não verificado`
5. `UserService.upsert`:
   - `findOneAndUpdate({ googleSub }, input, { upsert: true })`
   - Se a URL do avatar mudou, baixa para `static/users/<userId>.<ext>` e atualiza `picture` para `/static/users/...`
   - Mantém apenas a versão local; se o arquivo sumir no disco, re-baixa no próximo login
6. Backend assina um JWT com `JwtService.sign(claims)` onde `claims: JwtPayload`:
   ```ts
   { _id, email, name, picture?, isAdmin, isActive }
   ```
   Expiração padrão `30d` (`JWT_EXPIRES_IN`).
7. Frontend recebe `{ token }`, persiste em `localStorage`, decodifica via `jwt-decode` e popula o `AuthProvider`.

## Estrutura no backend

```
backend/src/auth/
├── auth.controller.ts       POST /auth/google (público)
├── auth.service.ts          loginWithGoogle, verifyGoogleToken, signToken
├── auth.module.ts           Provê JwtModule, AuthService, JwtStrategy
├── jwt.strategy.ts          Passport JwtStrategy (extrai do header Bearer)
├── jwt-auth.guard.ts        Guarda referenciada como APP_GUARD global
└── dto/google-login.dto.ts  Validação do body { credential }
```

### `JwtAuthGuard` global

Registrada em `app.module.ts` como `APP_GUARD`:

```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard }
]
```

Isso significa que **toda rota é autenticada por padrão**. Para tornar uma rota pública, basta marcar com o decorator `@Public()` (definido em `common/public.decorator.ts`); a guarda consulta esse metadata via Reflector e pula a verificação.

Apenas duas rotas são públicas hoje:
- `GET /healthcheck`
- `POST /auth/google`

### `AdminGuard`

`backend/src/common/admin.guard.ts` — lê `request.user.isAdmin` e lança `ForbiddenException('Acesso restrito a administradores')` se for falso. Aplicado em handlers individuais (não global), tipicamente em rotas de:
- `team/` (importação)
- `match/` (importação, atualização manual de placares)
- `stage/` (listar tudo, avançar status)
- `user/` (listar tudo, atualizar)

### Verificação de e-mail

```ts
private isEmailAuthoritative(email: string, hd?: string) {
  return email.endsWith('@gmail.com') || !!hd
}
```

Se for `@gmail.com` ou tiver `hd` (Google Workspace), o Google é tido como autoridade do e-mail e a verificação adicional é dispensada. Para outros provedores, exige `email_verified: true` no payload do ID token.

## Estrutura no frontend

### `AuthProvider`

`frontend/src/providers/AuthProvider.tsx` mantém:
- `token: string | null` (sincronizado com `localStorage`)
- `user: AuthenticatedUser | null` (decodificado do JWT)
- Métodos `login(idToken)` (chama `POST /auth/google`) e `logout()`

### Guardas de rota

- **`ProtectedRoute`** — redireciona para `/login` se não houver `token`
- **`PublicOnlyRoute`** — redireciona para `/` se já houver `token` (usado em `/login`)
- **`AdminRoute`** — exige `user.isAdmin === true`; caso contrário, redireciona para `/`

### Cliente HTTP

`frontend/src/lib/api.ts` injeta automaticamente o header `Authorization` quando há token. Em resposta `401`, o cliente força logout (limpa `localStorage` e redireciona para `/login`).

## Ciclo de vida da sessão

- **Expiração:** 30 dias por default. Após expirar, qualquer chamada retorna `401` e o frontend desloga o usuário.
- **Re-emissão:** não há refresh token. O usuário precisa logar de novo.
- **Multi-aba:** o `localStorage` é compartilhado entre abas do mesmo domínio; a sessão se propaga (a leitura é feita no boot do `AuthProvider`).
- **Logout:** limpa `localStorage` e zera o estado do provider. JWT continua válido no backend até expirar (não há blocklist).

## Primeiro login

Um novo usuário aparece com `isActive: false` e `isAdmin: false`. Sem ativação manual via Admin:
- Ele consegue navegar (vê o ranking, stats, etc.)
- **Não recebe palpites** em branco — `seedBetsForStage` e `seedBetsForUser` filtram por `isActive: true`
- O `BetsScreen` mostrará estado vazio até que um admin o ative

Para tornar-se admin manualmente (boot do projeto):
```js
// no mongo shell
db.users.updateOne({ email: 'seu@email' }, { $set: { isAdmin: true, isActive: true } })
```

Depois faça logout e login de novo para reemitir o JWT com `isAdmin: true`.

## Avatar local

O backend baixa o avatar do Google **uma vez** e serve a partir de `/static/users/<userId>.<ext>`. Motivos:
- Evita dependência da URL do Google em runtime (CDNs do Google podem mudar/expirar)
- Cache `Cache-Control: public, max-age=31536000, immutable`

Atualização do avatar:
- Em todo login, se a URL externa (`picture` do payload Google) mudou em relação ao último valor armazenado, re-baixa
- Se o arquivo local sumiu do disco mas o registro ainda aponta para `/static/`, re-baixa

## Erros e como tratá-los

| Cenário                                       | Resposta                                |
|-----------------------------------------------|-----------------------------------------|
| `credential` ausente/inválido                 | `401 Falha ao verificar token do Google`|
| Payload sem `sub`/`email`/`name`              | `401 Google token payload incompleto`   |
| E-mail não verificado e não autoritativo      | `401 E-mail do Google não verificado`   |
| Qualquer outro erro na verificação            | `401 Falha ao verificar token do Google`|
| Acesso a rota admin sem `isAdmin`             | `403 Acesso restrito a administradores` |
| Acesso a rota autenticada sem JWT             | `401 Unauthorized` (padrão NestJS)      |
