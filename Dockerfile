# Multi-stage production Dockerfile for NestJS + Chromium (@angelitosystems/nestjs-pdf)

# ----------------------------------------------------
# Stage 1: Build & Dependencies
# ----------------------------------------------------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Runner
# ----------------------------------------------------
FROM node:20-bookworm-slim AS runner

# Install system dependencies required by Chromium and dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Inform Playwright to use system chromium executable
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app

# Create unprivileged user for security
RUN groupadd -r nestjs && useradd -r -g nestjs -G audio,video nestjs \
    && mkdir -p /home/nestjs/Downloads /app/dist /app/storage \
    && chown -R nestjs:nestjs /home/nestjs /app

USER nestjs

# Dumb-init prevents zombie Chromium processes in containerized environments
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/main.js"]

