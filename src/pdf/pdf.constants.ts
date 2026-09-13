/**
 * Injection token for the PDF Module Options.
 */
export const PDF_MODULE_OPTIONS = 'PDF_MODULE_OPTIONS';

/**
 * Injection token for the PDF Engine.
 */
export const PDF_ENGINE = 'PDF_ENGINE';

/**
 * Injection token for the Template Engine.
 */
export const TEMPLATE_ENGINE = 'TEMPLATE_ENGINE';

/**
 * Injection token for the Storage Adapter.
 */
export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';

/**
 * Injection token for the Asset Manager.
 */
export const ASSET_MANAGER = 'ASSET_MANAGER';

/**
 * Injection token for the Browser Manager / Pool.
 */
export const BROWSER_MANAGER = 'BROWSER_MANAGER';

/**
 * Default timeout for PDF generation in milliseconds (30 seconds).
 */
export const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Default maximum queue waiting time in milliseconds (30 seconds).
 */
export const DEFAULT_QUEUE_TIMEOUT_MS = 30000;

/**
 * Default concurrency limit for simultaneous PDF rendering.
 */
export const DEFAULT_CONCURRENCY = 5;

/**
 * Default browser pool minimum and maximum size.
 */
export const DEFAULT_POOL_MIN = 1;
export const DEFAULT_POOL_MAX = 5;
export const DEFAULT_MAX_OPERATIONS_PER_BROWSER = 100;

/**
 * Standard PDF MIME type.
 */
export const PDF_MIME_TYPE = 'application/pdf';

