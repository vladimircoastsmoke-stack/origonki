FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
COPY apps/admin/package.json apps/admin/
COPY apps/bigscreen/package.json apps/bigscreen/
COPY apps/player/package.json apps/player/
RUN pnpm install --frozen-lockfile || pnpm install

# Build everything
COPY packages/shared packages/shared
COPY apps/server apps/server
COPY apps/admin apps/admin
COPY apps/bigscreen apps/bigscreen
COPY apps/player apps/player
COPY scripts scripts

ENV NODE_ENV=production
RUN pnpm --filter @decibel-racing/shared build && \
    pnpm --filter @decibel-racing/admin build && \
    pnpm --filter @decibel-racing/bigscreen build && \
    pnpm --filter @decibel-racing/player build && \
    node scripts/copy-static.mjs && \
    pnpm --filter @decibel-racing/server build

RUN mkdir -p apps/server/uploads

EXPOSE 3001
ENV PORT=3001
WORKDIR /app/apps/server
CMD ["node", "dist/index.js"]
