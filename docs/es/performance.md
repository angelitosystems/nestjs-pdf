# Rendimiento y Optimización para Producción

La generación de documentos PDF demanda recursos significativos de CPU y memoria. `@angelitosystems/nestjs-pdf` provee mecanismos nativos para maximizar el throughput evitando fugas de memoria y saturación de procesos.

## 1. Browser Process Pooling

Lanzar un proceso nuevo de Chromium toma entre 500ms y 1500ms y consume memoria considerable.

`BrowserPoolService` gestiona un pool de procesos calientes:
- **Reutilización**: Los procesos de Chrome se reutilizan entre solicitudes mediante instancias aisladas de `BrowserContext` y `Page`.
- **Precalentamiento**: `pool.min` mantiene instancias listas para responder de inmediato.
- **Prevención de Fugas**: Los procesos se reciclan limpiamente al alcanzar `maxOperationsPerBrowser` (100 por defecto).
- **Apagado Limpio**: Todos los procesos se cierran ordenadamente al detener NestJS (`OnModuleDestroy`).

```typescript
PdfModule.forRoot({
  browser: {
    pool: {
      min: 2,                          // Procesos listos en espera
      max: 6,                          // Límite ante ráfagas de tráfico
      maxOperationsPerBrowser: 100,     // Recicla el proceso cada 100 documentos
    },
  },
});
```

## 2. Cola de Concurrencia en Memoria

En picos de tráfico, ejecutar demasiados renders simultáneos puede ocasionar un bloqueo por falta de memoria (OOM).

`ConcurrencyQueueService` aplica un control estricto FIFO:
- **`concurrency`**: Limita el número de renders simultáneos (5 por defecto).
- **`queueTimeout`**: Evita que las peticiones se queden indefinidamente en espera (30,000ms por defecto).

```typescript
PdfModule.forRoot({
  concurrency: {
    concurrency: 5,
    queueTimeout: 20000,
  },
});
```

## 3. Caché de Compilación de Plantillas

Habilita la caché en memoria para evitar leer y compilar repetidamente los templates de Handlebars desde disco:

```typescript
PdfModule.forRoot({
  cache: {
    enabled: true,
    maxItems: 100,
    ttlMs: 3600000, // 1 hora
  },
});
```
