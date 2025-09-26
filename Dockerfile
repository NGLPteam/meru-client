FROM node:22-bullseye AS base

FROM base AS deps
ENV NODE_ENV=production
ENV WDP_APP=frontend
WORKDIR /app
COPY package.json yarn.lock* .yarnrc.yml ./
COPY .yarn ./.yarn/

RUN corepack enable
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

FROM base AS builder

WORKDIR /app

ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH=/app/node_modules/sharp
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV WDP_APP=frontend

# COMMON ENVS
ENV NEXT_PUBLIC_VERSION="1.0.0"
ENV NEXT_PUBLIC_ORDER_PATH_OPTIONS="props.volume.sortable_number,props.sortable_number,props.id"

# SCRAMBLED RUNTIME ENVS
ENV NEXT_PUBLIC_KEYCLOAK_REALM="NP--KC--REALM"
ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="NP--KC--CLIENT_ID"
ENV NEXT_PUBLIC_KEYCLOAK_URL="NP--KC--URL"
ENV NEXT_PUBLIC_FE_URL="NP--FE--URL"
ENV NEXT_PUBLIC_ADMIN_URL="NP--ADMIN--URL"
ENV NEXT_PUBLIC_API_URL="NP--API--URL"
ENV NEXT_PUBLIC_TUS_URL="NP--TUS--URL"

COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

RUN corepack enable

RUN --mount=type=cache,target=/app/.next/cache yarn build

COPY docker/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 3000

CMD ["yarn", "start"]