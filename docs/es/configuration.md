# Guía de Configuración

`@angelitosystems/nestjs-pdf` ofrece diversos modos de configuración: cero configuración, rutas ejecutables explícitas, pools de procesos y conexiones remotas CDP.

## Configuración Cero (Zero Config)

Si dispones de Chrome, Edge o Chromium en el sistema:

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

## Modos del Navegador

Define el comportamiento de adquisición del navegador con la opción `mode`:

```typescript
type BrowserMode = 'auto' | 'executable' | 'connect';
```

### 1. Modo `auto` (Predeterminado)
1. Utiliza `browser.executablePath` si fue especificado.
2. Si no, busca automáticamente Chrome, Edge o Chromium instalados en el sistema anfitrión.
3. Si no encuentra ninguno, lanza la excepción `PdfBrowserNotFoundError`.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'auto',
  },
});
```

### 2. Modo `executable`
Exige estrictamente el uso del `executablePath` configurado. Si el archivo no existe o no es ejecutable, lanza `PdfBrowserExecutableInvalidError`.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'executable',
    executablePath: '/usr/bin/chromium',
  },
});
```

### 3. Modo `connect`
Permite conectarse a una instancia remota de Chrome/Chromium mediante Chrome DevTools Protocol (CDP) o WebSocket.

```typescript
PdfModule.forRoot({
  browser: {
    mode: 'connect',
    endpoint: 'http://browserless-host:9222',
  },
});
```

## Configuración del Browser Pool

Controla el número de instancias calientes y su reciclaje automático para evitar fugas de memoria:

```typescript
PdfModule.forRoot({
  browser: {
    pool: {
      min: 1,                          // Procesos mínimos en espera (warm standby)
      max: 5,                          // Procesos máximos permitidos concurrentemente
      maxOperationsPerBrowser: 100,     // Recicla el proceso de Chrome tras 100 renders
    },
  },
});
```

## Configuración Asíncrona

Inyecta dependencias dinámicamente con `forRootAsync`:

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

PdfModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    browser: {
      executablePath: config.get<string>('BROWSER_PATH'),
      pool: {
        min: config.get<number>('PDF_POOL_MIN', 1),
        max: config.get<number>('PDF_POOL_MAX', 5),
      },
    },
  }),
});
```
