# syntax=docker/dockerfile:1
###############################################################################
# Toolshare web (Next.js standalone) for Google Cloud Run.
#
# Monorepo: pnpm workspace + Turborepo. Only @toolshare/web is installed and
# built — the Expo/React Native app is filtered out so it never enters a Linux
# build. Debian (glibc) base so native deps (sharp, lightningcss) get prebuilts.
###############################################################################

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

###############################################################################
# builder — filtered install + standalone build
###############################################################################
FROM base AS builder

# Public, build-time-INLINED values (safe to embed in the client bundle).
# Passed via --build-arg from cloudbuild.yaml.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_BUGREPORT_ENDPOINT
ARG NEXT_PUBLIC_FORMSPREE_ENDPOINT
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_BUGREPORT_ENDPOINT=$NEXT_PUBLIC_BUGREPORT_ENDPOINT \
    NEXT_PUBLIC_FORMSPREE_ENDPOINT=$NEXT_PUBLIC_FORMSPREE_ENDPOINT

RUN corepack prepare pnpm@9.15.1 --activate

# --- dependency layer: cached until a manifest or the lockfile changes ---
# Every workspace manifest is copied so --frozen-lockfile can validate the
# whole workspace against the lockfile; the --filter limits what's installed.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/web/package.json      ./apps/web/
COPY apps/mobile/package.json   ./apps/mobile/
COPY packages/domain/package.json   ./packages/domain/
COPY packages/supabase/package.json ./packages/supabase/
COPY packages/types/package.json    ./packages/types/
COPY packages/ui/package.json       ./packages/ui/
COPY packages/lib/package.json      ./packages/lib/
# Install @toolshare/web and its workspace deps only (skips expo/react-native).
RUN pnpm install --frozen-lockfile --filter @toolshare/web...

# --- source + build ---
COPY . .
RUN pnpm turbo run build --filter=@toolshare/web

###############################################################################
# runner — minimal runtime image (just the standalone output)
###############################################################################
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
WORKDIR /app
USER node

# The standalone bundle already contains a traced node_modules + server.js.
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
# Static assets are not part of standalone output — copy them into place.
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 8080
CMD ["node", "apps/web/server.js"]
