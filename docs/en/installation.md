# Installation Guide

`@angelitosystems/nestjs-pdf` is an enterprise-grade PDF generation library designed for NestJS applications using `playwright-core`.

## Package Managers

Install the package via your preferred package manager:

```bash
# Bun
bun add @angelitosystems/nestjs-pdf

# NPM
npm install @angelitosystems/nestjs-pdf

# PNPM
pnpm add @angelitosystems/nestjs-pdf

# Yarn
yarn add @angelitosystems/nestjs-pdf
```

## Why `playwright-core`?

Traditional Playwright libraries bundle automatic downloads of Chromium binaries (~500MB) during `npm install`. This package strictly depends on `playwright-core`, ensuring:

1. **Fast Installs**: Zero megabytes of browser downloads during `npm install` or `bun add`.
2. **Zero CI/CD Overhead**: Pipeline runners do not waste bandwidth downloading redundant browsers.
3. **Container-Friendly**: Docker images can use optimized system Chromium packages (`/usr/bin/chromium`).

## System Requirements

To render modern HTML, CSS, Flexbox, and Grid, the host system needs a compatible Chromium-based browser:
- **Google Chrome** (Windows, Linux, macOS)
- **Microsoft Edge** (Windows, Linux, macOS)
- **Chromium** (Windows, Linux, macOS)

If you already have any of these browsers installed on your operating system, `@angelitosystems/nestjs-pdf` will detect and use it automatically.

## Verifying with Doctor CLI

Run the diagnostic tool to confirm readiness:

```bash
bunx angelito-pdf doctor
# or
npx angelito-pdf doctor
```
