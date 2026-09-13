import { Translations } from './types';

export const es: Translations = {
  common: {
    getStarted: 'Comenzar',
    viewOnNpm: 'Ver en npm',
    githubRepo: 'GitHub',
    documentation: 'Documentación',
    guides: 'Guías',
    apiReference: 'Referencia API',
    searchPlaceholder: 'Buscar documentación...',
    searchShortcut: 'Ctrl K',
    copy: 'Copiar',
    copied: '¡Copiado!',
    builtForNestjs: 'Creado para NestJS',
    version: 'Versión',
    license: 'Licencia',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    tableOfContents: 'En esta página',
    next: 'Siguiente',
    previous: 'Anterior',
  },
  landing: {
    heroTitle: 'Generación de PDFs de nivel empresarial para NestJS.',
    heroSubtitle:
      'Genera documentos PDF de alta fidelidad desde plantillas HTML, CSS y Handlebars utilizando una arquitectura modular de NestJS impulsada por Playwright, con pool de navegadores aislados y defensa contra SSRF.',
    quickInstall: 'Instalación Rápida',
    whyTitle: '¿Por qué elegir @angelitosystems/nestjs-pdf?',
    whySubtitle:
      'Diseñado específicamente para microservicios de misión crítica, evitando envoltorios frágiles y fugas de memoria mediante patrones nativos de NestJS.',
    stats: {
      nativeNestjs: 'Nativo de NestJS',
      nativeNestjsDesc: 'Módulos dinámicos desacoplados y tokens DI Symbol',
      playwrightCore: 'Playwright Core',
      playwrightCoreDesc: 'BrowserContext y Page aislados por cada solicitud',
      securityFirst: 'Protección SSRF',
      securityFirstDesc: 'Bloqueo de subredes RFC1918, metadata cloud y path traversal',
      zeroVulnerabilities: '0 Vulnerabilidades',
      zeroVulnerabilitiesDesc: 'Supera auditorías estrictas de seguridad de producción',
      typedArchitecture: '100% TypeScript',
      typedArchitectureDesc: 'Opciones, eventos y resultados con tipado riguroso',
    },
    terminal: {
      title: 'Terminal de Configuración Rápida',
      installedSuccess: 'paquete instalado exitosamente en',
      readyToGenerate: '¡Listo para generar PDFs con NestJS!',
    },
    workflowTitle: 'Cómo Funciona: Pipeline Modular y Limpio',
    workflowSubtitle:
      'Cada generación sigue un ciclo de vida seguro y aislado garantizando que los navegadores nunca filtren memoria ni estado.',
    ctaTitle: '¿Listo para generar PDFs empresariales en minutos?',
    ctaSubtitle:
      'Explora nuestra guía de inicio rápido, revisa recetas Docker de producción o consulta la referencia completa de la API.',
  },
  features: [
    {
      id: 'modular',
      title: 'Verdadera Arquitectura NestJS',
      description:
        'Dividido en 9 submódulos cohesivos (Renderer, Template, Browser, Engine, Storage, Queue, Security, Asset) con soporte completo para forRoot y forRootAsync.',
    },
    {
      id: 'pool',
      title: 'Pool de Navegadores Resiliente',
      description:
        'Reutiliza instancias de Chromium mientras crea instancias limpias y aisladas de BrowserContext y Page por cada trabajo, reciclándolas programadamente.',
    },
    {
      id: 'concurrency',
      title: 'Cola de Concurrencia en Memoria',
      description:
        'Control de backpressure FIFO integrado con limitación de concurrencia, detección de timeout y cancelación mediante el estándar AbortSignal.',
    },
    {
      id: 'security',
      title: 'Defensa contra SSRF y Path Traversal',
      description:
        'Pre-resolución DNS para bloquear subredes privadas (RFC 1918), endpoints de metadata de AWS/GCP (169.254.169.254), evasión hex/DWORD y escapes de directorio.',
    },
    {
      id: 'templates',
      title: 'Handlebars y Helpers Integrados',
      description:
        'Incluye helpers preconfigurados para moneda, formateo de fechas, comparadores, serialización JSON, lógica condicional y registro de helpers personalizados.',
    },
    {
      id: 'pagination',
      title: 'Encabezados, Pies y Marcas de Agua',
      description:
        'Paginación nativa del motor de impresión de Chromium mediante etiquetas pageNumber/totalPages, más marcas de agua dinámicas y rotadas en múltiples páginas.',
    },
    {
      id: 'storage',
      title: 'Adaptadores de Almacenamiento Extensibles',
      description:
        'Token STORAGE_ADAPTER intercambiable con LocalStorageService incluido y fácil integración para AWS S3, MinIO o Azure Blob.',
    },
    {
      id: 'streaming',
      title: 'Streaming HTTP Independiente del Framework',
      description:
        'Método sendToHttp compatible tanto con adaptadores de Express como de Fastify, gestionando cabeceras y streams de buffers automáticamente.',
    },
    {
      id: 'docker',
      title: 'Listo para Docker en Producción y CI/CD',
      description:
        'Utiliza el paquete liviano playwright-core sin descargar 500MB de binarios durante npm install, respaldado por recetas Docker multi-etapa verificadas.',
    },
  ],
};

