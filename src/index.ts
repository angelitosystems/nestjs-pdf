// Main Module and Facade Service
export { PdfModule } from './pdf/pdf.module';
export { PdfService } from './pdf/pdf.service';

// Modules (for advanced NestJS composition)
export { RendererModule } from './renderer/renderer.module';
export { TemplateModule } from './template/template.module';
export { EngineModule } from './engine/engine.module';
export { StorageModule } from './storage/storage.module';
export { BrowserModule } from './browser/browser.module';
export { QueueModule } from './queue/queue.module';
export { SecurityModule } from './security/security.module';
export { AssetModule } from './asset/asset.module';

// Specialized Services (available for direct injection if needed)
export { PdfRendererService } from './renderer/renderer.service';
export { TemplateService } from './template/template.service';
export { StorageService } from './storage/storage.service';
export { BrowserService } from './browser/browser.service';
export { ConcurrencyQueueService } from './queue/concurrency-queue.service';
export { PdfSecurityService } from './security/security.service';
export { AssetService } from './asset/asset.service';

// Injection Tokens
export {
  PDF_MODULE_OPTIONS,
  PDF_ENGINE,
  TEMPLATE_ENGINE,
  STORAGE_ADAPTER,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_QUEUE_TIMEOUT_MS,
  DEFAULT_CONCURRENCY,
  PDF_MIME_TYPE,
} from './common/constants/tokens.constants';

// Abstract Extensibility Contracts
export type { PdfEngine } from './engine/pdf-engine.interface';
export type { EngineRenderOptions, PdfEngineOptions } from './engine/engine.types';
export type { TemplateEngine } from './template/template-engine.interface';
export type { RenderTemplateOptions } from './template/template.types';
export type { StorageAdapter } from './storage/storage.interface';
export type { StorageSaveOptions } from './storage/storage.types';

// Concrete Default Implementations (for custom DI overrides)
export { PlaywrightPdfEngine } from './engine/playwright/playwright.engine';
export { HandlebarsTemplateEngine } from './template/handlebars/handlebars.engine';
export { LocalStorageService } from './storage/local/local-storage.service';

// Types and Options
export type {
  GeneratePdfOptions,
  PdfGenerateOptions,
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
  ConcurrencyOptions,
  StorageOptions,
  PdfDefaults,
  HandlebarsConfig,
  PdfEvent,
  PdfEventType,
  PdfEventListener,
} from './common/types/pdf.types';

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
} from './common/exceptions/pdf.exceptions';
