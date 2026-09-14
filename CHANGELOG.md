# Changelog

All notable changes to `@angelitosystems/nestjs-pdf` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.3] - 2026-09-14

### Changed
- Extended `peerDependencies` range for `@nestjs/common` and `@nestjs/core` to officially support NestJS v12 (`^12.0.0`).

## [0.1.2] - 2026-09-13

### Changed
- Documentation website and assets updates.

## [0.1.0] - 2026-09-13

### Added
- **Core NestJS Architecture**:
  - Pure modular architecture featuring `PdfModule`, `PdfRendererModule`, `PdfTemplateModule`, `PdfBrowserModule`, `PdfEngineModule`, `PdfStorageModule`, `PdfQueueModule`, `PdfSecurityModule`, and `PdfAssetModule`.
  - Full support for `PdfModule.forRoot(options)` and `PdfModule.forRootAsync(asyncOptions)` with `useFactory`, `useClass`, and `useExisting`.
  - Unique `Symbol()`-based injection tokens: `PDF_MODULE_OPTIONS`, `PDF_ENGINE`, `TEMPLATE_ENGINE`, `STORAGE_ADAPTER`.
  - Extensible adapter architecture via abstract classes `PdfEngine`, `TemplateEngine`, and `StorageAdapter`.
- **Browser Management & Recycling**:
  - Resilient `BrowserPoolService` utilizing `playwright-core`.
  - Isolated, clean `BrowserContext` and `Page` per request, never shared across requests.
  - Strict lifecycle cleanup ensuring `Page` and `BrowserContext` close in `finally` blocks.
  - Automatic browser health detection, crash recovery, and scheduled browser recycling based on configurable operation thresholds (`maxOperationsPerBrowser`).
- **Rendering & Templates**:
  - `PdfRendererService` orchestrator supporting Handlebars templates (both inline and disk files).
  - Robust built-in Handlebars helpers (`currency`, `formatDate`, `eq`, `ne`, `gt`, `lt`, `gte`, `lte`, `and`, `or`, `uppercase`, `lowercase`, `json`, `default`).
  - Native pagination and page-number injection using Chromium printing template tags (`<span class="pageNumber"></span>`, `<span class="totalPages"></span>`).
  - Dynamic watermark support with configurable text, opacity, rotation angle, font size, and color.
  - Embedded CSS, local custom fonts (`@font-face`), and local image assets converted automatically into Base64 Data URIs.
- **Queue & Concurrency Control**:
  - In-memory FIFO `ConcurrencyQueueService` with configurable maximum concurrent generation slots (`limit`).
  - Queued task timeout handling (`queueTimeout`) and cancellation via native `AbortSignal`.
- **Security & SSRF Hardening**:
  - Strict path traversal protection preventing directory escapes (`../`, null bytes `%00`, symlink traversal).
  - SSRF protection validating external URLs and resolving DNS to block private subnets (RFC 1918, RFC 4193), AWS/GCP cloud metadata endpoints (`169.254.169.254`), IPv6 loopback, and encoded integer/hex IP representations.
  - Asset size thresholds (`maxAssetSizeBytes`) to prevent denial-of-service via memory exhaustion.
- **Storage & Stream Utilities**:
  - Built-in `LocalStorageService` with automatic directory resolution.
  - `PdfResult` abstraction providing `.toBuffer()`, `.toStream()`, `.save(destination)`, and framework-agnostic HTTP streaming `.sendToHttp(res)` compatible with both Express and Fastify.
- **CI/CD & Documentation**:
  - GitHub Actions workflows for continuous integration (Node.js 18, 20, 22), automated security scanning (CodeQL + audit), trusted NPM OIDC publishing with provenance, and GitHub Pages documentation deployment.
  - Production-ready multi-stage `Dockerfile` with Chromium and `dumb-init`.
  - Standalone documentation portal built with Vite, React, TypeScript, and Tailwind CSS.

