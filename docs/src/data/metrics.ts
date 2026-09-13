export interface MetricItem {
  labelEn: string;
  labelEs: string;
  value: string;
  subEn: string;
  subEs: string;
  highlight?: boolean;
}

export const metricsData: MetricItem[] = [
  {
    labelEn: 'Current Version',
    labelEs: 'Versión Actual',
    value: '0.1.0',
    subEn: 'Published on NPM',
    subEs: 'Publicado en NPM',
    highlight: true,
  },
  {
    labelEn: 'Vulnerabilities',
    labelEs: 'Vulnerabilidades',
    value: '0',
    subEn: 'Strict npm audit passed',
    subEs: 'npm audit superado con 0 alertas',
    highlight: true,
  },
  {
    labelEn: 'Test Suite',
    labelEs: 'Suite de Pruebas',
    value: '70/70',
    subEn: '100% passing tests (10 suites)',
    subEs: '100% de tests aprobados (10 suites)',
  },
  {
    labelEn: 'License',
    labelEs: 'Licencia',
    value: 'MIT',
    subEn: 'Open-source permissive',
    subEs: 'Open-source permisiva',
  },
  {
    labelEn: 'NestJS Support',
    labelEs: 'Soporte NestJS',
    value: 'v10 / v11',
    subEn: 'Peer dependency verified',
    subEs: 'Peer dependency verificada',
  },
  {
    labelEn: 'Package Engine',
    labelEs: 'Motor del Paquete',
    value: 'Playwright',
    subEn: 'Lightweight core with zero bundled bloat',
    subEs: 'Core liviano sin binarios pesados incluidos',
  },
];
