import { Translations } from './types';

export const en: Translations = {
  common: {
    getStarted: 'Get Started',
    viewOnNpm: 'View on npm',
    githubRepo: 'GitHub',
    documentation: 'Documentation',
    guides: 'Guides',
    apiReference: 'API Reference',
    searchPlaceholder: 'Search documentation...',
    searchShortcut: 'Ctrl K',
    copy: 'Copy',
    copied: 'Copied!',
    builtForNestjs: 'Built for NestJS',
    version: 'Version',
    license: 'License',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    tableOfContents: 'On this page',
    next: 'Next',
    previous: 'Previous',
  },
  landing: {
    heroTitle: 'Production-ready PDF generation for NestJS.',
    heroSubtitle:
      'Generate high-fidelity PDF documents from HTML, CSS, and Handlebars templates using a modular NestJS architecture powered by Playwright with isolated browser pools and SSRF defense.',
    quickInstall: 'Quick Installation',
    whyTitle: 'Why @angelitosystems/nestjs-pdf?',
    whySubtitle:
      'Engineered specifically for mission-critical microservices, avoiding brittle wrappers and memory leaks through enterprise NestJS patterns.',
    stats: {
      nativeNestjs: 'NestJS Native',
      nativeNestjsDesc: 'Decoupled dynamic modules & Symbol DI tokens',
      playwrightCore: 'Playwright Core',
      playwrightCoreDesc: 'Isolated BrowserContext and Page per request',
      securityFirst: 'SSRF Hardened',
      securityFirstDesc: 'RFC1918 subnets, cloud metadata & path traversal block',
      zeroVulnerabilities: '0 Vulnerabilities',
      zeroVulnerabilitiesDesc: 'Passing strict production security audits',
      typedArchitecture: '100% TypeScript',
      typedArchitectureDesc: 'End-to-end typed options, events, and results',
    },
    terminal: {
      title: 'Quick Setup Terminal',
      installedSuccess: 'installed 1 package in',
      readyToGenerate: 'Ready to generate PDFs with NestJS!',
    },
    workflowTitle: 'How It Works: Clean Layered Pipeline',
    workflowSubtitle:
      'Every generation follows a secure, isolated lifecycle ensuring browsers never leak memory or state.',
    ctaTitle: 'Ready to generate enterprise PDFs in minutes?',
    ctaSubtitle:
      'Explore our comprehensive quick-start guide, examine production Docker recipes, or inspect the complete API reference.',
  },
  features: [
    {
      id: 'modular',
      title: 'True NestJS Architecture',
      description:
        'Split into 9 cohesive submodules (Renderer, Template, Browser, Engine, Storage, Queue, Security, Asset) with dynamic forRoot and forRootAsync support.',
    },
    {
      id: 'pool',
      title: 'Resilient Browser Pool',
      description:
        'Reuses Chromium instances while spawning clean, isolated BrowserContext and Page instances per job, with scheduled recycling to stop memory leaks.',
    },
    {
      id: 'concurrency',
      title: 'In-Memory Concurrency Queue',
      description:
        'Built-in FIFO backpressure with concurrency throttling, task timeout detection, and cancellation via standard AbortSignal.',
    },
    {
      id: 'security',
      title: 'SSRF & Path Traversal Guard',
      description:
        'Pre-resolves DNS to block private subnets (RFC 1918), AWS/GCP metadata endpoints (169.254.169.254), hex/DWORD IP bypasses, and directory escapes.',
    },
    {
      id: 'templates',
      title: 'Handlebars & Built-in Helpers',
      description:
        'Includes pre-registered helpers for currency, date formatting, comparisons, JSON serialization, conditional logic, and custom helper registration.',
    },
    {
      id: 'pagination',
      title: 'Headers, Footers & Watermarks',
      description:
        'True Chromium printing pagination with native pageNumber/totalPages spans, plus dynamic multi-page rotated watermarks.',
    },
    {
      id: 'storage',
      title: 'Extensible Storage Adapters',
      description:
        'Hot-swappable STORAGE_ADAPTER token with built-in LocalStorageService and straightforward adapters for AWS S3, MinIO, or Azure Blob.',
    },
    {
      id: 'streaming',
      title: 'Framework-Agnostic HTTP Streaming',
      description:
        'Streamlined sendToHttp method compatible with both Express and Fastify adapters, handling headers and buffer streams automatically.',
    },
    {
      id: 'docker',
      title: 'Production Docker & CI/CD Ready',
      description:
        'Uses lightweight playwright-core without automatic 500MB downloads during npm install, backed by verified multi-stage Docker recipes.',
    },
  ],
};

