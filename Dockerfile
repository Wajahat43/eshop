FROM node:18-alpine AS base
WORKDIR /app
ENV NPM_CONFIG_AUDIT=false

# Install OS deps for prisma / openssl
RUN apk add --no-cache openssl

# Copy manifests and sources
COPY package*.json nx.json tsconfig.json tsconfig.base.json eslint.config.mjs ./
COPY apps ./apps
COPY packages ./packages
COPY prisma ./prisma

# Copy environment file if it exists
COPY .env* ./

# Install deps
RUN npm ci --legacy-peer-deps --no-audit

# Generate prisma client
RUN npx prisma generate

# Build services
RUN npx nx build api-gateway auth-service product-service order-service chat-service --configuration=production

# Runtime
FROM node:18-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl

# Copy built output and minimal files
COPY --from=base /app/apps /app/apps
COPY --from=base /app/node_modules /app/node_modules
COPY --from=base /app/prisma /app/prisma
COPY --from=base /app/.env* ./
COPY ecosystem.config.js ./ecosystem.config.js

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

RUN npm i -g pm2

CMD pm2-runtime ecosystem.config.js


