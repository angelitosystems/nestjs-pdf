# Architecture & Design

`@angelitosystems/nestjs-pdf` is organized into focused submodules following clean architecture principles and NestJS dependency injection patterns.

## Modular Component Structure

```text
src/
├── browser/
│   ├── browser-detector.ts       # Cross-platform host browser detection
│   ├── browser-launcher.ts       # Encapsulates playwright-core launch & CDP connect
│   ├── browser-manager.service.ts # High-level browser acquisition & release
│   ├── browser-pool.service.ts   # Pool management, warming, and recycling
│   ├── browser.service.ts        # Execution of isolated contexts and pages
│   └── browser.types.ts          # Pool and browser type definitions
│
├── core/ & pdf/
│   ├── pdf.module.ts             # Global entry point dynamic module
│   ├── pdf.service.ts            # Public API facade
│   └── pdf.result.ts             # Result wrapper (buffers, streams, saving, HTTP)
│
├── engine/
│   ├── pdf-engine.interface.ts   # Abstract engine interface
│   └── playwright/               # Concrete playwright-core engine implementation
│
├── renderer/
│   └── renderer.service.ts       # Template compilation, assets & styles inlining
│
├── security/
│   ├── security.service.ts       # Security validations coordinator
│   └── security.utils.ts         # Path traversal & SSRF defense algorithms
│
└── storage/
    ├── storage.interface.ts      # Abstract storage interface
    └── local/                    # Local filesystem storage adapter
```

## Browser Isolation Lifecycle

For every generation request:

```text
BrowserService.runWithPage()
         │
         ├── 1. Acquire browser from BrowserPoolService
         ├── 2. Create fresh isolated BrowserContext
         ├── 3. Create fresh Page
         ├── 4. Execute render operation
         ├── 5. Close Page & Context
         └── 6. Release browser to Pool (recycle if maxOperations reached)
```
