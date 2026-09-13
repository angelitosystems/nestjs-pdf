export interface NavItem {
  id: string;
  titleEn: string;
  titleEs: string;
  badge?: string;
}

export interface NavSection {
  id: string;
  titleEn: string;
  titleEs: string;
  icon: string;
  items: NavItem[];
}

export const navigationData: NavSection[] = [
  {
    id: 'getting-started',
    titleEn: 'Getting Started',
    titleEs: 'Primeros Pasos',
    icon: 'BookOpen',
    items: [
      { id: 'introduction', titleEn: 'Introduction', titleEs: 'Introducción' },
      { id: 'installation', titleEn: 'Installation', titleEs: 'Instalación' },
      { id: 'quick-start', titleEn: 'Quick Start', titleEs: 'Inicio Rápido', badge: '5 min' },
      { id: 'configuration', titleEn: 'Configuration', titleEs: 'Configuración' },
    ],
  },
  {
    id: 'core-concepts',
    titleEn: 'Core Concepts',
    titleEs: 'Conceptos Clave',
    icon: 'Layers',
    items: [
      { id: 'pdf-module', titleEn: 'PdfModule', titleEs: 'PdfModule' },
      { id: 'pdf-service', titleEn: 'PdfService', titleEs: 'PdfService' },
      { id: 'rendering', titleEn: 'Rendering Pipeline', titleEs: 'Pipeline de Renderizado' },
      { id: 'templates', titleEn: 'Templates Engine', titleEs: 'Motor de Plantillas' },
      { id: 'assets', titleEn: 'Assets & Fonts', titleEs: 'Recursos y Fuentes' },
      { id: 'browser-management', titleEn: 'Browser Management', titleEs: 'Gestión de Navegadores' },
      { id: 'security', titleEn: 'Security & SSRF', titleEs: 'Seguridad y SSRF' },
      { id: 'storage', titleEn: 'Storage Adapters', titleEs: 'Adaptadores de Storage' },
      { id: 'queue', titleEn: 'Concurrency Queue', titleEs: 'Cola de Concurrencia' },
    ],
  },
  {
    id: 'guides',
    titleEn: 'Guides',
    titleEs: 'Guías Prácticas',
    icon: 'Zap',
    items: [
      { id: 'generate-pdf', titleEn: 'Generate a PDF', titleEs: 'Generar un PDF' },
      { id: 'html-templates', titleEn: 'HTML & CSS Layouts', titleEs: 'Diseños HTML y CSS' },
      { id: 'handlebars-helpers', titleEn: 'Handlebars Helpers', titleEs: 'Helpers de Handlebars' },
      { id: 'headers-footers', titleEn: 'Headers, Footers & Watermarks', titleEs: 'Encabezados, Pies y Marcas de Agua' },
      { id: 'images-fonts', titleEn: 'Images & Custom Fonts', titleEs: 'Imágenes y Fuentes Locales' },
      { id: 'custom-engines', titleEn: 'Custom PDF Engines', titleEs: 'Motores PDF Personalizados' },
      { id: 'custom-storage', titleEn: 'Custom Storage (S3 / MinIO)', titleEs: 'Almacenamiento Custom (S3 / MinIO)' },
      { id: 'production-setup', titleEn: 'Production Checklist', titleEs: 'Checklist para Producción' },
    ],
  },
  {
    id: 'api-reference',
    titleEn: 'API Reference',
    titleEs: 'Referencia API',
    icon: 'Code',
    items: [
      { id: 'api-pdf-service', titleEn: 'PdfService API', titleEs: 'API de PdfService' },
      { id: 'api-pdf-result', titleEn: 'PdfResult API', titleEs: 'API de PdfResult' },
      { id: 'api-pdf-module', titleEn: 'PdfModule forRoot / forRootAsync', titleEs: 'PdfModule forRoot / forRootAsync' },
      { id: 'api-types', titleEn: 'Types & Options Reference', titleEs: 'Tipos y Opciones' },
      { id: 'api-interfaces', titleEn: 'Abstract Classes & Contracts', titleEs: 'Clases Abstractas y Contratos' },
      { id: 'api-tokens', titleEn: 'Dependency Injection Tokens', titleEs: 'Tokens de Inyección de Dependencias' },
    ],
  },
  {
    id: 'advanced',
    titleEn: 'Advanced',
    titleEs: 'Avanzado',
    icon: 'Cpu',
    items: [
      { id: 'browser-pool-adv', titleEn: 'Browser Pool & Recycling', titleEs: 'Pool y Reciclaje de Navegadores' },
      { id: 'concurrency-adv', titleEn: 'Concurrency & AbortSignal', titleEs: 'Concurrencia y AbortSignal' },
      { id: 'security-adv', titleEn: 'SSRF & Traversal Architecture', titleEs: 'Arquitectura SSRF y Traversal' },
      { id: 'performance-adv', titleEn: 'Performance & Optimization', titleEs: 'Rendimiento y Optimización' },
      { id: 'extending-library', titleEn: 'Extending the Library (SOLID)', titleEs: 'Extensión de la Librería (SOLID)' },
    ],
  },
  {
    id: 'deployment',
    titleEn: 'Deployment',
    titleEs: 'Despliegue',
    icon: 'Server',
    items: [
      { id: 'docker-deployment', titleEn: 'Docker Multi-Stage', titleEs: 'Docker Multi-Etapa' },
      { id: 'linux-setup', titleEn: 'Linux & Chromium Packages', titleEs: 'Linux y Paquetes Chromium' },
      { id: 'cicd-github-actions', titleEn: 'CI/CD with GitHub Actions', titleEs: 'CI/CD con GitHub Actions' },
      { id: 'production-deployment', titleEn: 'Kubernetes & Cloud Ready', titleEs: 'Preparado para Kubernetes y Cloud' },
    ],
  },
];
