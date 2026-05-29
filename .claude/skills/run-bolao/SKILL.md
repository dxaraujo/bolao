---
name: run-bolao
description: Build, run, and drive the Bolão da Copa 2026 app (NestJS backend + Vite/React frontend). Use when asked to start the app, run it locally, take a screenshot of a screen, reach the admin/apostas/ranking pages, or confirm a change works in the running app.
---

Bolão is a pnpm monorepo: a NestJS API (`:3000`) + a Vite/React PWA (`:5173`, proxies `/api` → `:3000`) + a shared package. There's no GUI window — you drive it headless with **`.claude/skills/run-bolao/driver.mjs`**, a Playwright (`chromium`) script that mints a JWT, injects it into `localStorage`, and screenshots each route. Login is Google OAuth, so the driver **bypasses it** by signing its own token with the backend's `AUTH_SECRET` (the backend trusts any token signed with that secret — `JwtStrategy.validate()` never hits the DB).

All paths below are relative to the repo root (`/Users/dxaraujo/Pessoal/bolao`).

> ⚠️ **The committed `backend/.env` points `MONGODB_URI` at a real MongoDB Atlas (production) cluster.** Never run the smoke test against it. Every command below overrides `MONGODB_URI` to a throwaway **local** Mongo. Keep that override.

## Prerequisites

Verified on macOS (this is not a Linux container). You need:

- **Node ≥ 20.11**, **pnpm 11** (`corepack enable` picks it up from the `packageManager` field).
- **Docker** (for local Mongo). Start Docker Desktop with `open -a Docker`, then wait: `until docker info >/dev/null 2>&1; do :; done`.
- **Playwright + Chromium** for the driver, installed *inside the skill dir* (keeps it out of the app's lockfile):

```bash
cd .claude/skills/run-bolao && npm install && npx playwright install chromium && cd -
```

## Setup

```bash
pnpm install
cp -n backend/.env.example backend/.env    # only if you have no .env; otherwise keep yours
cp -n frontend/.env.example frontend/.env
pnpm build:shared                          # both sides import @bolao/shared from dist/
```

The driver reads `AUTH_SECRET` straight from `backend/.env`, so the minted token always matches the running backend — whatever secret is configured.

## Run (agent path)

**1. Local Mongo** (never the Atlas one in `.env`):

```bash
docker compose up -d mongo
until docker exec bolao-mongo mongosh --quiet --eval 'db.adminCommand("ping")' >/dev/null 2>&1; do :; done
```

**2. Backend**, pinned to local Mongo, in background:

```bash
MONGODB_URI='mongodb://localhost:27017/bolao_run' CORS_ORIGINS='http://localhost:5173' \
  pnpm dev:backend > /tmp/bolao-backend.log 2>&1 &
until curl -sf http://localhost:3000/healthcheck >/dev/null; do :; done
```

On boot the app imports real teams + matches from Football Data into the local DB, so the UI has real WC-2026 fixtures to render.

**3. Frontend**, in background:

```bash
pnpm dev:frontend > /tmp/bolao-frontend.log 2>&1 &
until curl -sf http://localhost:5173 >/dev/null; do :; done
```

**4. Seed the driver's user.** The token's `_id` must exist in the DB with `isAdmin`/`isActive` true, or the `/apostas` and `/admin` guards bounce you (they read `/api/user/me` from the DB, not the JWT):

```bash
docker exec bolao-mongo mongosh bolao_run --quiet --eval '
db.users.updateOne(
  { _id: ObjectId("000000000000000000000001") },
  { $set: { googleSub:"driver-bot", name:"Driver Bot", email:"driver@bolao.local", isAdmin:true, isActive:true } },
  { upsert: true })'
```

**5. Drive it.** Run from the skill dir (where Playwright lives):

```bash
cd .claude/skills/run-bolao && node driver.mjs
```

Output is one line per route with the path it landed on. Screenshots → `/tmp/bolao-shots/` (`login.png`, `home.png`, `ranking.png`, `apostas.png`, `bolao.png`, `stats.png`, `admin.png`). A clean run reports `Console errors: 0`.

| command | what it does |
|---|---|
| `node driver.mjs` | login (anonymous) + all 6 authed routes, admin token |
| `node driver.mjs /ranking /stats` | only those routes |
| `node driver.mjs --role=spectator` | token with `isActive:false` — backend rejects writes (403). See the two-layer-auth gotcha below. |
| `node driver.mjs --print-token` | print a JWT to stdout and exit (for `curl`) |

**Direct API smoke** (no browser):

```bash
TOK=$(cd .claude/skills/run-bolao && node driver.mjs --print-token)
curl -s -H "Authorization: Bearer $TOK" http://localhost:3000/api/user/me | jq .
```

**Stop everything:**

```bash
pkill -f 'nest start'; pkill -f vite; docker compose down   # add -v to wipe the local Mongo volume
```

## Run (human path)

`pnpm dev` runs backend + frontend together; open http://localhost:5173 and log in with Google. Useless headless (real OAuth + a browser window), so agents use the driver instead.

## Gotchas

- **`backend/.env` `MONGODB_URI` is the production Atlas cluster.** Always pass the local override (step 2). dotenv does *not* overwrite an env var already set in the shell, so the inline `MONGODB_URI=...` wins — that's why the override works.
- **`/admin` redirects on a cold `page.goto`.** `AdminRoute` navigates away the instant `/me` is still `undefined`; a fresh page load has an empty query cache. The driver sidesteps this by loading `/` once then **clicking the BottomNav** (in-SPA nav keeps `/me` cached). Don't switch the authed sweep back to per-route `goto`.
- **`/apostas` and `/admin` need the seeded user** (step 4) — their guards read `isActive`/`isAdmin` from `/api/user/me` (the DB), not from the JWT. The other routes only need a valid token.
- **Two layers of auth, and they're independent.** The JWT claims drive *backend* authorization (e.g. `ActiveParticipantGuard` rejects bet writes with 403 when the token says `isActive:false`). The *frontend* nav and guards (Apostas/Admin visibility) follow `/api/user/me` = the **DB user**. So `--role=spectator` only changes backend behavior; to see the spectator *UI*, also reseed the DB user inactive: `db.users.updateOne({_id:ObjectId("000000000000000000000001")},{$set:{isActive:false}})`.
- **All screenshots identical in byte size = they all rendered the login page** (token missing/rejected). The driver logs `landed:` per route so you can catch a redirect without opening the images.
- **One benign console error on `/login`:** `Framing 'https://accounts.google.com/' violates ... frame-ancestors`. It's the Google button's CSP report; ignore it.
- **mobile-first UI:** the driver uses a 430×932 viewport. The `md:` desktop nav is hidden; the BottomNav is what's clickable.

## Troubleshooting

- **`Cannot connect to the Docker daemon` / socket missing:** Docker Desktop isn't fully up. `open -a Docker` and wait for `docker info` to succeed. If multiple contexts exist (Desktop, OrbStack), `docker context use desktop-linux` (or whichever `docker info` reports).
- **Backend log shows `Bootstrap sync failed`:** harmless for the smoke test — the Football Data import failed (bad/rate-limited key), but the app still serves. The DB just has fewer fixtures.
- **`EADDRINUSE :3000` / `:5173`:** a previous run is still up. `pkill -f 'nest start'; pkill -f vite` before relaunching.
- **`Cannot find package 'playwright'`:** you ran `driver.mjs` from the wrong dir, or skipped `npm install` in the skill dir. `cd .claude/skills/run-bolao` first.
