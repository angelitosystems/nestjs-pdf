# Performance & Production Optimization

Generating PDFs requires significant CPU and memory resources. `@angelitosystems/nestjs-pdf` provides built-in mechanisms to maximize throughput while preventing memory leaks and process saturation.

## 1. Browser Process Pooling

Launching a fresh Chrome process takes between 500ms and 1500ms and consumes substantial memory.

`BrowserPoolService` maintains a pool of warm browser processes:
- **Reuse**: Browser processes are shared across requests using isolated `BrowserContext` and `Page` objects.
- **Warming**: `pool.min` keeps ready instances available for immediate generation.
- **Leak Prevention**: Browsers are cleanly recycled and restarted after `maxOperationsPerBrowser` (default: 100).
- **Graceful Shutdown**: All browser processes are closed when the NestJS application shuts down (`OnModuleDestroy`).

```typescript
PdfModule.forRoot({
  browser: {
    pool: {
      min: 2,                          // Warm standby instances
      max: 6,                          // Scale limit under heavy burst
      maxOperationsPerBrowser: 100,     // Recycle after 100 operations
    },
  },
});
```

## 2. In-Memory Concurrency Queue

Under traffic spikes, launching excessive concurrent renders can trigger OOM (Out Of Memory) kills.

`ConcurrencyQueueService` applies FIFO queuing:
- **`concurrency`**: Caps the maximum number of simultaneous renders (default: 5).
- **`queueTimeout`**: Prevents requests from waiting indefinitely in queue (default: 30,000ms).

```typescript
PdfModule.forRoot({
  concurrency: {
    concurrency: 5,
    queueTimeout: 20000,
  },
});
```

## 3. Template Compilation Caching

Enable template caching to avoid recompiling Handlebars templates repeatedly on disk:

```typescript
PdfModule.forRoot({
  cache: {
    enabled: true,
    maxItems: 100,
    ttlMs: 3600000, // 1 hour
  },
});
```
