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
bun add @angelitosystems/nestjs-pdf
# or
npm install @angelitosystems/nestjs-pdf
```

> [!IMPORTANT]
> **Zero Automatic Downloads**: This package uses `playwright-core` exclusively and **does not** download browsers automatically during installation. A compatible Chromium-based browser (Google Chrome, Microsoft Edge, or Chromium) must be installed on the host or configured through `executablePath`.

### 🩺 System Doctor CLI

You can verify that your operating system has a compatible browser installed at any time using our built-in CLI:

```bash
bunx angelito-pdf doctor
# or
npx angelito-pdf doctor
```

Output:
```text
╭────────────────────────────────────────────╮
│        Angelito Systems PDF Engine         │
╰────────────────────────────────────────────╯

✓ @angelitosystems/nestjs-pdf
✓ playwright-core
✓ Operating system: Windows (x64)
✓ Node.js compatible

Browser detection:

✓ Google Chrome
  C:\Program Files\Google\Chrome\Application\chrome.exe
✓ Microsoft Edge
  C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

PDF engine is ready.
```

---

## 🚀 Quick Start

### 1. Register the Module (Zero Configuration)

If you have Chrome, Edge, or Chromium installed, no browser configuration is needed:

```typescript
import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot(),
  ],
})
export class AppModule {}
```

### Or with Custom Browser Configuration

```typescript
import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      concurrency: 5,
      browser: {
        mode: 'auto', // 'auto' | 'executable' | 'connect'
        // Optional explicit path (overrides auto-detection):
        // Linux: '/usr/bin/chromium'
        // Windows: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        pool: {
          min: 1,
          max: 5,
          maxOperationsPerBrowser: 100,
        },
      },
      security: {
        allowExternalResources: false,
        maxAssetSizeBytes: 10 * 1024 * 1024,
      },
    }),
  ],
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
      header: {
        html: '<div style="font-size: 10px; width: 100%; text-align: right;">Internal Record</div>',
      },
      footer: {
        html: '<div style="font-size: 10px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
        pageNumbers: true,
      },
    });

    // Directly stream to Express or Fastify response
    await pdf.send(res, {
      filename: 'invoice-2026-001.pdf',
      disposition: 'attachment',
    });
    // Tip: `await pdf.sendToHttp(res, ...)` is also available as an alias.
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
        concurrency: config.get<number>('PDF_CONCURRENCY_LIMIT', 10),
        queueTimeout: 30000,
        browser: {
          min: config.get<number>('PDF_BROWSER_MIN', 1),
          max: config.get<number>('PDF_BROWSER_MAX', 4),
          launchOptions: {
            executablePath: config.get<string>('CHROMIUM_PATH'),
          },
        },
      }),
    }),
  ],
})
export class AppModule {}
```

---

## 📋 Configuration Options (`PdfModuleOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `templatesPath` | `string` | `'./templates'` | Directory where Handlebars templates reside on disk |
| `concurrency` | `number \| ConcurrencyOptions` | `5` | Maximum concurrent PDF renders (can be a number or `{ concurrency, limit, queueTimeout }`) |
| `queueTimeout` | `number` | `30000` | Max milliseconds a generation request can wait in the queue before rejection |
| `timeout` | `number` | `30000` | Render timeout in milliseconds passed to Playwright |
| `browser.min` | `number` | `1` | Standby warm Chromium browser instances |
| `browser.max` | `number` | `5` | Maximum concurrent browser processes created |
| `browser.maxOperationsPerBrowser` | `number` | `100` | Automatically recycles browser process after N renders to prevent memory leaks |
| `browser.executablePath` | `string` | `undefined` | Custom Chromium/Chrome executable path (e.g. `/usr/bin/chromium`) |
| `browser.launchOptions` | `Record<string, unknown>` | `{}` | Additional Playwright launch arguments and options |
| `security.allowExternalResources`| `boolean` | `false` | Enables fetching external HTTP/HTTPS assets (images, stylesheets) |
| `security.allowedDomains` | `string[]` | `[]` | Whitelist of allowed domains when external resources are enabled |
| `security.allowedAssetPaths` | `string[]` | `[]` | Whitelist of local directories permitted for asset loading |
| `security.maxAssetSizeBytes` | `number` | `10485760` (10MB) | Maximum allowed size in bytes for a single asset |
| `cache.enabled` | `boolean` | `false` | Enables in-memory caching of compiled Handlebars templates |
| `cache.maxItems` | `number` | `undefined` | Maximum compiled templates kept in LRU cache |
| `cache.ttlMs` | `number` | `undefined` | Cache TTL in milliseconds |
| `queue.concurrency` | `number` | `5` | Maximum concurrent jobs in the queue |
| `queue.queueTimeout` | `number` | `30000` | Queue timeout in milliseconds |
| `defaultFormat` | `PdfFormat` | `'A4'` | Default paper size (`'A4'`, `'Letter'`, `'Legal'`, etc.) |
| `defaultOrientation` | `'portrait' \| 'landscape'` | `'portrait'` | Default page orientation |
| `defaultMargins` | `PdfMargins` | `undefined` | Default page margins (`top`, `right`, `bottom`, `left`) |
| `providers` | `Provider[]` | `[]` | Custom providers to register inside `PdfModule` |
| `onEvent` | `(event: PdfEvent) => void` | `undefined` | Lifecycle event listener for logging and APM metrics |

---

## 📄 Generation Options (`GeneratePdfOptions`)

| Option | Type | Description |
| :--- | :--- | :--- |
| `template` | `string` | Template name (e.g. `'invoice'` resolves to `./templates/invoice/template.hbs` or `invoice.hbs`) |
| `html` | `string` | Raw inline HTML string (alternative to `template`) |
| `data` | `Record<string, unknown>` | Data context passed to Handlebars |
| `format` | `PdfFormat` | Paper format: `'A4'`, `'Letter'`, `'Legal'`, `'A3'`, etc. |
| `orientation` | `'portrait' \| 'landscape'` | Page orientation (default: `'portrait'`) |
| `margins` | `PdfMargins` | Margins (e.g. `{ top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }`) |
| `printBackground` | `boolean` | Print CSS backgrounds and colors (default: `true`) |
| `header` | `PdfHeaderFooter` | Header configuration: `{ html?: string, template?: string, height?: string }` |
| `footer` | `PdfHeaderFooter` | Footer configuration: `{ html?: string, template?: string, pageNumbers?: boolean }` |
| `watermark` | `PdfWatermark` | Diagonal watermark: `{ text: string, opacity?: number, color?: string, fontSize?: string }` |
| `fonts` | `PdfFont[]` | Custom web fonts to embed via base64 |
| `css` | `string` | Extra CSS to inject into rendered document |
| `signal` | `AbortSignal` | Native cancellation signal (e.g. from `req.on('close')`) |
| `timeout` | `number` | Specific timeout for this generation job (in ms) |

---

## 📦 Result Consumption (`PdfResult`)

`const pdf = await pdfService.generate({ ... });`

- **`pdf.buffer`** / **`pdf.toBuffer()`**: Returns the raw PDF `Buffer`.
- **`pdf.stream()`** / **`pdf.toStream()`**: Returns a Node.js `Readable` stream.
- **`pdf.size`**: Size of the PDF in bytes.
- **`pdf.filename`**: The suggested or generated filename.
- **`pdf.mimeType`**: Always `'application/pdf'`.
- **`await pdf.save(destinationPath)`**: Persists the PDF using the configured `StorageAdapter`.
- **`await pdf.send(res, options)`** / **`await pdf.sendToHttp(res, options)`**: Streams the PDF directly into Express or Fastify responses with appropriate `Content-Disposition`, `Content-Type`, and `Content-Length` headers.

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

