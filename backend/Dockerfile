# syntax=docker/dockerfile:1.7

# ============================================================
# Build context: deve ser o ROOT do monorepo
# Uso:  docker build -f backend/Dockerfile -t bolao-backend .
# ============================================================

# ---------- Stage 1: deps & build ----------
FROM node:20-alpine AS builder

WORKDIR /repo
RUN corepack enable

# Manifests primeiro para cachear o install
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json ./backend/

RUN pnpm install --frozen-lockfile --filter ./backend...

# Código fonte e build
COPY backend/ ./backend/
RUN pnpm --filter ./backend build

# Re-instala apenas prod deps numa pasta limpa para o runtime
RUN pnpm install --frozen-lockfile --prod --filter ./backend... \
	&& pnpm prune --prod --filter ./backend

# ---------- Stage 2: runtime ----------
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# pnpm cria symlinks para uma store hoisted no root; precisamos copiar a árvore inteira
COPY --from=builder --chown=node:node /repo/node_modules ./node_modules
COPY --from=builder --chown=node:node /repo/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=node:node /repo/backend/dist ./backend/dist
COPY --from=builder --chown=node:node /repo/backend/package.json ./backend/package.json

USER node
WORKDIR /app/backend

EXPOSE 3001
CMD ["node", "dist/main.js"]
