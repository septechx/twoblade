# syntax = docker/dockerfile:1

ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base-node
WORKDIR /app
ENV NODE_ENV="production"

FROM base-node AS build-main

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    node-gyp \
    pkg-config \
    python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

COPY website/package.json website/package-lock.json* ./

RUN npm ci --include=dev

COPY website/. ./

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ARG PUBLIC_DOMAIN
ENV PUBLIC_DOMAIN=$PUBLIC_DOMAIN
ARG PUBLIC_WEBSOCKET
ENV PUBLIC_WEBSOCKET=$PUBLIC_WEBSOCKET
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET
ARG PRIVATE_B2_KEY_ID
ENV PRIVATE_B2_KEY_ID=$PRIVATE_B2_KEY_ID
ARG PRIVATE_B2_APP_KEY
ENV PRIVATE_B2_APP_KEY=$PRIVATE_B2_APP_KEY
ARG PRIVATE_B2_BUCKET
ENV PRIVATE_B2_BUCKET=$PRIVATE_B2_BUCKET
ARG PRIVATE_B2_REGION
ENV PRIVATE_B2_REGION=$PRIVATE_B2_REGION
ARG PRIVATE_B2_ENDPOINT
ENV PRIVATE_B2_ENDPOINT=$PRIVATE_B2_ENDPOINT
ARG REDIS_URL
ENV REDIS_URL=$REDIS_URL
ARG PUBLIC_TURNSTILE_SITE_KEY
ENV PUBLIC_TURNSTILE_SITE_KEY=$PUBLIC_TURNSTILE_SITE_KEY

RUN npm run build

RUN npm prune --omit=dev

FROM base-node AS build-websocket
WORKDIR /app/websocket

COPY website/websocket/package.json ./
COPY website/websocket/tsconfig.json ./
COPY website/websocket/src ./src/

RUN npm install
RUN npm install typescript @types/node clsx tailwind-merge

RUN npx tsc --project tsconfig.json

FROM base-node AS production-main

COPY --from=build-main --chown=node:node /app/build ./build
COPY --from=build-main --chown=node:node /app/node_modules ./node_modules
COPY --from=build-main --chown=node:node /app/package.json .

COPY --from=build-main --chown=node:node /app/cluster-server.js ./

USER node
EXPOSE 3000
CMD ["node", "cluster-server.js"]

FROM base-node AS production-websocket
WORKDIR /app/websocket

COPY --from=build-websocket /app/websocket/node_modules ./node_modules
COPY --from=build-websocket /app/websocket/dist ./dist

USER node
EXPOSE 8080
CMD ["node", "dist/main.js"]
