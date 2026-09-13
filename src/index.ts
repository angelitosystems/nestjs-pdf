// Module and Service
export { PdfModule } from './pdf/pdf.module';
export { PdfService } from './pdf/pdf.service';

// Types and Options
export type {
  GeneratePdfOptions,
  PdfModuleOptions,
  PdfModuleAsyncOptions,
  PdfOptionsFactory,
  PdfResult,
  PdfFormat,
  PdfOrientation,
  PdfMargins,
  PdfDimensions,
  PdfFont,
  PdfWatermark,
  PdfHeaderFooter,
  PdfMetadata,
  SendHttpOptions,
  HttpResponseLike,
  PdfSecurityOptions,
  BrowserPoolOptions,
  PdfCacheOptions,
  HandlebarsConfig,
  PdfEvent,
  PdfEventType,
  PdfEventListener,
} from './pdf/pdf.types';

// Constants and Injection Tokens
export {
  PDF_MODULE_OPTIONS,
  PDF_ENGINE,
  TEMPLATE_ENGINE,
  STORAGE_ADAPTER,
  ASSET_MANAGER,
  BROWSER_MANAGER,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_QUEUE_TIMEOUT_MS,
  DEFAULT_CONCURRENCY,
  PDF_MIME_TYPE,
} from './pdf/pdf.constants';

// Error Classes
export {
  PdfError,
  PdfTemplateNotFoundError,
  PdfRenderingError,
  PdfTimeoutError,
  PdfAbortError,
  PdfEngineError,
  PdfAssetError,
  PdfSecurityError,
  PdfStorageError,
  PdfConfigurationError,
} from './pdf/pdf.exceptions';

// Extensibility Contracts & Adapters
export type { PdfEngine, EngineRenderOptions } from './engines/pdf-engine.interface';
export type { TemplateEngine, RenderTemplateOptions } from './templates/template-engine.interface';
export type { StorageAdapter, StorageSaveOptions } from './storage/storage.interface';
export { LocalStorageAdapter } from './storage/local.storage';
export { AssetManager } from './assets/asset-manager';
export { RendererService } from './rendering/renderer.service';

