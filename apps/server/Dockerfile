FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
COPY packages/shared packages/shared
COPY apps/server apps/server
COPY tsconfig.base.json ./
RUN pnpm --filter @decibel-racing/shared build
RUN pnpm --filter @decibel-racing/server build

FROM base AS runner
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/packages/shared /app/packages/shared
COPY --from=build /app/apps/server /app/apps/server
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
RUN mkdir -p /app/apps/server/uploads
WORKDIR /app/apps/server
EXPOSE 3001
CMD ["node", "dist/index.js"]
