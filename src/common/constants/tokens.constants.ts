/**
 * Injection Token for PDF Module Configuration Options.
 */
export const PDF_MODULE_OPTIONS = Symbol('PDF_MODULE_OPTIONS');

/**
 * Injection Token for the PDF Rendering Engine contract (Playwright, Puppeteer, PDFKit, etc.).
 */
export const PDF_ENGINE = Symbol('PDF_ENGINE');

/**
 * Injection Token for the Template Engine contract (Handlebars, EJS, Pug, etc.).
 */
export const TEMPLATE_ENGINE = Symbol('TEMPLATE_ENGINE');

/**
 * Injection Token for the Storage Adapter contract (LocalStorage, S3, MinIO, Azure, etc.).
 */
export const STORAGE_ADAPTER = Symbol('STORAGE_ADAPTER');

/**
 * Default constants
 */
export const DEFAULT_TIMEOUT_MS = 30000;
export const DEFAULT_QUEUE_TIMEOUT_MS = 30000;
export const DEFAULT_CONCURRENCY = 5;
export const DEFAULT_POOL_MIN = 1;
export const DEFAULT_POOL_MAX = 5;
export const DEFAULT_MAX_OPERATIONS_PER_BROWSER = 100;
export const PDF_MIME_TYPE = 'application/pdf';
