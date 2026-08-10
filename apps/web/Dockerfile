FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/js/package.json ./packages/js/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/types/ ./packages/types/
COPY packages/js/ ./packages/js/
COPY apps/web/ ./apps/web/

RUN pnpm --filter @crty/recycle-bin-types build
RUN pnpm --filter @crty/recycle-bin build
RUN pnpm --filter @crty/recycle-bin-web build

FROM nginx:alpine

COPY --from=builder /usr/src/app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
