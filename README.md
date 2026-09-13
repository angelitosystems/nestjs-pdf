# @angelitosystems/nestjs-pdf

<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" /></a>
</p>

<p align="center">
  <strong>Enterprise-Grade, Highly Decoupled PDF Generation Engine for NestJS Applications.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"><img src="https://img.shields.io/npm/v/@angelitosystems/nestjs-pdf.svg?style=flat-square" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"><img src="https://img.shields.io/npm/dm/@angelitosystems/nestjs-pdf.svg?style=flat-square" alt="NPM Downloads" /></a>
  <a href="https://github.com/AngelitoSystems/nestjs-pdf/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/AngelitoSystems/nestjs-pdf/ci.yml?branch=main&label=CI&style=flat-square" alt="CI Status" /></a>
  <a href="https://github.com/AngelitoSystems/nestjs-pdf/actions/workflows/security.yml"><img src="https://img.shields.io/github/actions/workflow/status/AngelitoSystems/nestjs-pdf/security.yml?branch=main&label=Security&style=flat-square" alt="Security Status" /></a>
  <a href="https://github.com/AngelitoSystems/nestjs-pdf/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@angelitosystems/nestjs-pdf.svg?style=flat-square" alt="Package License" /></a>
</p>

---

## 📖 Overview

`@angelitosystems/nestjs-pdf` is a robust, modular, and extensible PDF generation suite built from the ground up natively for the NestJS ecosystem. Unlike generic node wrappers, it adopts standard NestJS architectural patterns: strict dependency injection, decoupled modular components, dynamic modules (`forRoot` / `forRootAsync`), symbol tokens, lifecycle-aware resource cleanup, and hot-swappable provider adapters.

Powered by `playwright-core` under the hood, it eliminates heavyweight bundling issues, leverages isolated browser contexts per request, recycles browser processes on schedules, guards against SSRF / path traversal attacks, and offers built-in concurrency control.

---

## ✨ Key Features

- 🏗 **Pure NestJS Architecture**: Clean separation into submodules (`PdfRendererModule`, `PdfTemplateModule`, `PdfBrowserModule`, `PdfEngineModule`, `PdfStorageModule`, `PdfQueueModule`, `PdfSecurityModule`, `PdfAssetModule`).
- 🔄 **Dynamic Modules**: Full support for synchronous `forRoot(options)` and asynchronous `forRootAsync(asyncOptions)` with `useFactory`, `useClass`, or `useExisting`.
- 🔌 **Hot-Swappable Adapters**: Custom `PDF_ENGINE`, `TEMPLATE_ENGINE`, and `STORAGE_ADAPTER` injection tokens backed by clean abstract classes.
- ⚡ **Resilient Browser Pool**: Reusable Chromium instances with fresh `BrowserContext` and `Page` per generation. Automatic crash recovery, disconnected browser purging, and periodic recycling to prevent memory leaks.
- 🚦 **Concurrency & Backpressure**: In-memory FIFO queue with concurrency throttling, timeouts, and native `AbortSignal` cancellation support.
- 🎨 **Handlebars Engine**: Inline HTML or disk file templates, custom helpers registration, and pre-built formatting helpers (`currency`, `formatDate`, `json`, conditionals).
- 📄 **Headers, Footers & Native Pagination**: True Chromium printing template pagination (`<span class="pageNumber"></span>` / `<span class="totalPages"></span>`).
- 💧 **Dynamic Watermarks**: High-resolution, multi-page watermarks with customizable opacity, rotation, font, and color.
- 🛡 **Security & SSRF Hardening**: Path traversal prevention, symlink boundary checks, null-byte filters, and strict SSRF mitigation blocking private RFC 1918 subnets, cloud metadata (e.g., `169.254.169.254`), and alternative IP representations.
- 📦 **Framework-Agnostic HTTP Streaming**: Seamless `res.sendToHttp()` streaming compatible with both Express and Fastify.
- 🐳 **Docker & Production Ready**: Lightweight `playwright-core` dependency without automatic 500MB browser downloads during installation.

---

## 🏛 Architecture

```text
                                 +--------------------------------+
                                 |           PdfModule            |
                                 +--------------------------------+
                                                 |
                   +-----------------------------+-----------------------------+
                   |                             |                             |
     +---------------------------+ +---------------------------+ +---------------------------+
     |        PdfService         | |      PdfQueueModule       | |      PdfStorageModule     |
     |      (Public Facade)      | | (ConcurrencyQueueService) | | (StorageService / Local)  |
     +---------------------------+ +---------------------------+ +---------------------------+
                   |
     +---------------------------+
     |     PdfRendererModule     |
     |   (PdfRendererService)    |
     +---------------------------+
         |            |            \
+----------------+ +----------------+ +--------------------+
|PdfTemplateMod. | | PdfAssetModule | |   PdfEngineModule  |
|(HandlebarsEng.)| | (AssetService) | |(PlaywrightPdfEng.) |
+----------------+ +----------------+ +--------------------+
                            |                   |
                   +----------------+ +--------------------+
                   |PdfSecurityMod. | |  PdfBrowserModule  |
                   |(SecurityServ.) | |(BrowserPoolService)|
                   +----------------+ +--------------------+
```

---

## 📦 Installation

```bash
npm install @angelitosystems/nestjs-pdf playwright-core
```

### Install Chromium for Playwright

Because this package utilizes `playwright-core`, Chromium binaries are not downloaded automatically during `npm install`. Install Chromium explicitly:

```bash
npx playwright install chromium
```

> **Note**: In containerized or CI environments, you can point directly to system-installed Chromium packages (such as `/usr/bin/chromium`) using `browser.launchOptions.executablePath`.

---

## 🚀 Quick Start

### 1. Register the Module

```typescript
import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      browser: {
        min: 1,
        max: 3,
        maxOperationsPerBrowser: 50,
      },
      concurrency: {
        limit: 5,
        queueTimeout: 30000,
      },
      security: {
        allowExternalResources: false,
        maxAssetSizeBytes: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class AppModule {}
```

### 2. Generate and Stream PDFs

```typescript
import { Controller, Get, Res } from '@nestjs/common';
import { PdfService } from '@angelitosystems/nestjs-pdf';
import type { Response } from 'express';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id/pdf')
  async downloadInvoice(@Res() res: Response) {
    const pdf = await this.pdfService.generate({
      template: 'invoice', // Resolves to ./templates/invoice/template.hbs or ./templates/invoice.hbs
      data: {
        invoiceNumber: 'INV-2026-001',
        customerName: 'Acme Corporation',
        amount: 1450.50,
        createdAt: new Date(),
      },
      format: 'A4',
      printBackground: true,
      watermark: {
        text: 'PAID',
        opacity: 0.15,
        color: '#22c55e',
      },
      headerFooter: {
        headerTemplate: '<div style="font-size: 10px; width: 100%; text-align: right;">Internal Record</div>',
        footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        displayHeaderFooter: true,
      },
    });

    // Directly stream to Express or Fastify response
    await pdf.sendToHttp(res, {
      filename: 'invoice-2026-001.pdf',
      disposition: 'attachment',
    });
  }
}
```

---

## ⚙️ Asynchronous Configuration

Seamlessly inject `ConfigService` or other application providers using `forRootAsync`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PdfModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        templatesPath: config.get<string>('PDF_TEMPLATES_PATH', './templates'),
        browser: {
          min: config.get<number>('PDF_BROWSER_MIN', 1),
          max: config.get<number>('PDF_BROWSER_MAX', 4),
          launchOptions: {
            executablePath: config.get<string>('CHROMIUM_PATH'),
          },
        },
        concurrency: {
          limit: config.get<number>('PDF_CONCURRENCY_LIMIT', 10),
        },
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 🔌 Custom Providers and Adapters

All major engine interfaces are exported as abstract classes and can be replaced using standard NestJS dependency injection.

### Custom Storage Adapter (e.g. AWS S3 / MinIO)

```typescript
import { Injectable } from '@nestjs/common';
import { StorageAdapter, STORAGE_ADAPTER, StorageSaveOptions } from '@angelitosystems/nestjs-pdf';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter extends StorageAdapter {
  private readonly s3 = new S3Client({ region: 'us-east-1' });

  async save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string> {
    const bucket = 'my-pdf-bucket';
    await this.s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: destination,
      Body: buffer,
      ContentType: options?.mimeType || 'application/pdf',
    }));
    return `https://${bucket}.s3.amazonaws.com/${destination}`;
  }

  async exists(destination: string): Promise<boolean> {
    // Custom exists check
    return true;
  }

  async read(destination: string): Promise<Buffer> {
    // Custom read implementation
    return Buffer.from('');
  }

  async delete(destination: string): Promise<void> {
    // Custom delete implementation
  }
}

// In your module:
@Module({
  imports: [
    PdfModule.forRoot({
      providers: [
        {
          provide: STORAGE_ADAPTER,
          useClass: S3StorageAdapter,
        },
      ],
    }),
  ],
})
export class AppModule {}
```

Similarly, you can provide custom implementations for `PDF_ENGINE` and `TEMPLATE_ENGINE`.

---

## 🎯 Template Engine & Built-in Helpers

The built-in `HandlebarsTemplateEngine` comes with essential formatting helpers:

| Helper | Usage | Example |
| :--- | :--- | :--- |
| `currency` | `{{currency amount "USD" "en-US"}}` | `$1,450.50` |
| `formatDate` | `{{formatDate date "YYYY-MM-DD"}}` | `2026-09-13` |
| `uppercase` | `{{uppercase status}}` | `APPROVED` |
| `lowercase` | `{{lowercase email}}` | `user@example.com` |
| `default` | `{{default note "N/A"}}` | Returns `note` or `"N/A"` |
| `json` | `{{{json complexObject}}}` | Serializes to JSON string |
| `eq`, `ne` | `{{#if (eq role "ADMIN")}}...{{/if}}` | Equality comparison |
| `gt`, `gte`, `lt`, `lte` | `{{#if (gte score 70)}}...{{/if}}` | Numerical comparison |
| `and`, `or` | `{{#if (and isPaid (not isRefunded))}}...{{/if}}` | Logical operators |

---

## 🛡 Security Best Practices

### SSRF (Server-Side Request Forgery) Mitigation
- When `allowExternalResources` is `false` (default), external HTTP/HTTPS requests are strictly forbidden.
- When enabled, all domains must match your explicit `allowedDomains` whitelist.
- Any URL attempting to resolve to private networks (RFC 1918, RFC 4193), loopback addresses, link-local addresses, or cloud metadata endpoints (`169.254.169.254`) is immediately blocked and throws a `PdfSecurityError`.

### Path Traversal Defense
- Template files and static assets are verified against their canonical real paths (`realpath`).
- Attempts to escape allowed directories via `../`, URL encoded dots (`%2e%2e`), null bytes (`%00`), or symlinks are rejected before disk access.

---

## 🐳 Docker Deployment

Here is the recommended production Dockerfile for running NestJS with Chromium:

```dockerfile
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    chromium \
    fonts-liberation \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app
RUN groupadd -r nestjs && useradd -r -g nestjs nestjs \
    && mkdir -p /app/dist /app/storage \
    && chown -R nestjs:nestjs /app

USER nestjs
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

---

## 🧪 Testing

```bash
# Unit & Integration tests
npm test

# Type checking
npm run typecheck

# Code linting
npm run lint

# Security audit
npm audit
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <strong>AngelitoSystems</strong>
</p>

