FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy root workspaces configs and package.json files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/
COPY packages/js/package.json ./packages/js/
COPY apps/api/package.json ./apps/api/

# Install dependencies (only devDependencies needed for compiling typescript)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy code sources
COPY packages/types/ ./packages/types/
COPY packages/core/ ./packages/core/
COPY apps/api/ ./apps/api/

# Compile package code
RUN pnpm --filter @crty/recycle-bin-types build
RUN pnpm --filter @crty/recycle-bin-core build
RUN pnpm --filter @crty/recycle-bin-api build

FROM node:20-alpine

WORKDIR /usr/src/app
RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/types/package.json ./packages/types/
COPY packages/core/package.json ./packages/core/
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy compiled files and migrations
COPY --from=builder /usr/src/app/packages/types/dist ./packages/types/dist
COPY --from=builder /usr/src/app/packages/core/dist ./packages/core/dist
COPY --from=builder /usr/src/app/packages/core/drizzle ./packages/core/drizzle
COPY --from=builder /usr/src/app/apps/api/dist ./apps/api/dist

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "apps/api/dist/index.js"]
