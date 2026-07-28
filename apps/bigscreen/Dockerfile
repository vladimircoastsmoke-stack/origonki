FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY apps/bigscreen/package.json apps/bigscreen/
RUN pnpm install --frozen-lockfile || pnpm install

FROM deps AS build
COPY packages/shared packages/shared
COPY apps/bigscreen apps/bigscreen
COPY tsconfig.base.json ./
RUN pnpm --filter @decibel-racing/shared build
RUN pnpm --filter @decibel-racing/bigscreen build

FROM nginx:alpine AS runner
COPY --from=build /app/apps/bigscreen/dist /usr/share/nginx/html
EXPOSE 5174
CMD ["nginx", "-g", "daemon off;"]
