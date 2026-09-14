# Arquitectura y Diseño

`@angelitosystems/nestjs-pdf` está organizado en submódulos especializados siguiendo los patrones de inyección de dependencias de NestJS y desacoplamiento estricto.

## Estructura Modular

```text
src/
├── browser/
│   ├── browser-detector.ts       # Detección multiplataforma de navegadores en el host
│   ├── browser-launcher.ts       # Encapsula el lanzamiento y conexión con playwright-core
│   ├── browser-manager.service.ts # Gestión de ciclo de vida del navegador
│   ├── browser-pool.service.ts   # Pool de instancias calientes y reciclaje automático
│   ├── browser.service.ts        # Ejecución en contextos y páginas aisladas
│   └── browser.types.ts          # Definición de tipos y opciones
│
├── core/ & pdf/
│   ├── pdf.module.ts             # Módulo dinámico global forRoot / forRootAsync
│   ├── pdf.service.ts            # Fachada de API pública
│   └── pdf.result.ts             # Wrapper del resultado (buffers, streams, guardado, HTTP)
│
├── engine/
│   ├── pdf-engine.interface.ts   # Interfaz abstracta del motor de renderizado
│   └── playwright/               # Implementación concreta basada en playwright-core
│
├── renderer/
│   └── renderer.service.ts       # Orquestación de plantillas, assets y estilos inline
│
├── security/
│   ├── security.service.ts       # Coordinador de políticas de seguridad
│   └── security.utils.ts         # Algoritmos de protección SSRF y path traversal
│
└── storage/
    ├── storage.interface.ts      # Contrato abstracto de almacenamiento
    └── local/                    # Adaptador de almacenamiento en disco local
```

## Ciclo de Vida y Aislamiento

Por cada petición de PDF:

```text
BrowserService.runWithPage()
         │
         ├── 1. Adquiere navegador de BrowserPoolService
         ├── 2. Crea un BrowserContext aislado y nuevo
         ├── 3. Crea una Page limpia
         ├── 4. Ejecuta la renderización del PDF
         ├── 5. Cierra Page y Context
         └── 6. Libera el navegador al Pool (recicla proceso si superó maxOperations)
```
