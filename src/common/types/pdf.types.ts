import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Provider, Type } from '@nestjs/common';
import { Readable } from 'stream';

/**
 * Standard paper formats supported by the engine.
 */
export type PdfFormat =
  | 'Letter'
  | 'Legal'
  | 'Tabloid'
  | 'Ledger'
  | 'A0'
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6';

/**
 * Page orientation.
 */
export type PdfOrientation = 'portrait' | 'landscape';

/**
 * Page margin configuration. Dimensions can be specified with units: 'px', 'in', 'cm', 'mm'.
 */
export interface PdfMargins {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Custom page dimensions in pixels, inches, cm, or mm.
 */
export interface PdfDimensions {
  width: string;
  height: string;
}

/**
 * Custom font definition for rendering.
 */
export interface PdfFont {
  family: string;
  path: string;
  weight?: number | string;
  style?: 'normal' | 'italic' | 'oblique';
  format?: 'truetype' | 'opentype' | 'woff' | 'woff2';
}

/**
 * Watermark configuration rendered across all pages.
 */
export interface PdfWatermark {
  text: string;
  opacity?: number;
  rotate?: number;
  fontSize?: string;
  color?: string;
}

/**
 * Header / Footer configuration.
 */
export interface PdfHeaderFooter {
  /** Template name inside templates directory */
  template?: string;
  /** Direct HTML string to use */
  html?: string;
  /** Height reserved for header/footer (e.g. '20mm', '50px') */
  height?: string;
  /** Whether to enable automatic page numbers in footer */
  pageNumbers?: boolean;
  /** Custom data specific to header or footer rendering */
  data?: Record<string, unknown>;
}

/**
 * PDF document metadata.
 */
export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modDate?: Date;
}

/**
 * Security controls preventing SSRF and arbitrary filesystem access.
 */
export interface PdfSecurityOptions {
  /** Directories from which assets can be read. By default, templatesPath is allowed. */
  allowedAssetPaths?: string[];
  /** Whitelist of domains allowed when loading external HTTP/HTTPS resources */
  allowedDomains?: string[];
  /** Allow fetching external web resources. Default: false */
  allowExternalResources?: boolean;
  /** Maximum allowed size in bytes for a single asset (default: 10MB) */
  maxAssetSizeBytes?: number;
}

/**
 * Browser Pool and process configuration.
 */
export interface BrowserPoolOptions {
  /** Minimum number of browser instances kept warm (default: 1) */
  min?: number;
  /** Maximum number of browser instances in pool (default: 5) */
  max?: number;
  /** Number of renders before browser instance is cleanly recycled (default: 100) */
  maxOperationsPerBrowser?: number;
  /** Custom executable path for Chromium */
  executablePath?: string;
  /** Browser type to launch (default: 'chromium') */
  browserType?: 'chromium' | 'firefox' | 'webkit';
  /** Additional launch options passed to Playwright */
  launchOptions?: Record<string, unknown>;
}

/**
 * Template & asset caching options.
 */
export interface PdfCacheOptions {
  enabled?: boolean;
  maxItems?: number;
  ttlMs?: number;
}

/**
 * Concurrency queue configuration.
 */
export interface ConcurrencyOptions {
  /** Maximum simultaneous PDF renders (default: 5) */
  concurrency?: number;
  /** Alias for concurrency */
  limit?: number;
  /** Maximum queue wait time before timeout rejection in ms (default: 30000) */
  queueTimeout?: number;
}

/**
 * Handlebars engine configuration.
 */
export interface HandlebarsConfig {
  helpers?: Record<string, (...args: unknown[]) => unknown>;
}

/**
 * Storage configuration options.
 */
export interface StorageOptions {
  basePath?: string;
}

/**
 * Global default rendering options.
 */
export interface PdfDefaults {
  format?: PdfFormat;
  orientation?: PdfOrientation;
  margins?: PdfMargins;
}

/**
 * Lifecycle event names for observability and logging.
 */
export type PdfEventType =
  | 'generation.started'
  | 'generation.completed'
  | 'generation.failed'
  | 'browser.created'
  | 'browser.recycled'
  | 'browser.error'
  | 'queue.waiting'
  | 'queue.completed';

/**
 * Structured payload emitted for observability events.
 */
export interface PdfEvent {
  type: PdfEventType;
  timestamp: Date;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: Error;
}

/**
 * Listener function for PDF events.
 */
export type PdfEventListener = (event: PdfEvent) => void;

/**
 * Module-level configuration options.
 */
export interface PdfModuleOptions {
  /** Default path where templates are stored. Default: './templates' */
  templatesPath?: string;
  /** Engine to use. Default: 'playwright' */
  engine?: 'playwright' | string;
  /** Default paper format. Default: 'A4' */
  defaultFormat?: PdfFormat;
  /** Default orientation. Default: 'portrait' */
  defaultOrientation?: PdfOrientation;
  /** Default margins */
  defaultMargins?: PdfMargins;
  /** Concurrency limit for simultaneous PDF generations (default: 5) or concurrency options */
  concurrency?: number | ConcurrencyOptions;
  /** Maximum queue wait time before rejecting with timeout in ms (default: 30000) */
  queueTimeout?: number;
  /** Overall render timeout in ms (default: 30000) */
  timeout?: number;
  /** Browser pool configuration */
  browser?: BrowserPoolOptions;
  /** Security policies */
  security?: PdfSecurityOptions;
  /** Cache settings for templates and assets */
  cache?: PdfCacheOptions;
  /** Concurrency queue options */
  queue?: ConcurrencyOptions;
  /** Storage configuration */
  storage?: StorageOptions;
  /** Handlebars options */
  handlebars?: HandlebarsConfig;
  /** Global defaults */
  defaults?: PdfDefaults;
  /** Enable built-in NestJS logger. Default: true */
  logger?: {
    enabled?: boolean;
  };
  /** Observability event listeners */
  onEvent?: PdfEventListener;
  /** Custom providers registered within PdfModule */
  providers?: Provider[];
}

/**
 * Factory options for async module registration.
 */
export interface PdfOptionsFactory {
  createPdfOptions(): Promise<PdfModuleOptions> | PdfModuleOptions;
}

export interface PdfModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<PdfOptionsFactory>;
  useClass?: Type<PdfOptionsFactory>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory?: (...args: any[]) => Promise<PdfModuleOptions> | PdfModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  extraProviders?: Provider[];
}

/**
 * Options provided when generating a specific PDF.
 */
export interface GeneratePdfOptions {
  /** Name of the template located in templatesPath, or relative path to .hbs */
  template?: string;
  /** Direct HTML string to render (alternative to template) */
  html?: string;
  /** Data context passed to the template */
  data?: Record<string, unknown>;
  /** Suggested output filename (e.g. 'invoice-1001.pdf') */
  filename?: string;
  /** Paper format (e.g. 'A4', 'Letter') */
  format?: PdfFormat;
  /** Custom page dimensions */
  dimensions?: PdfDimensions;
  /** Page orientation */
  orientation?: PdfOrientation;
  /** Page margins */
  margins?: PdfMargins;
  /** Whether to print background graphics. Default: true */
  printBackground?: boolean;
  /** Give any CSS @page size declared in the page priority over format/dimensions. Default: true */
  preferCSSPageSize?: boolean;
  /** Scale of the webpage rendering. Between 0.1 and 2. Default: 1 */
  scale?: number;
  /** Page ranges to print, e.g., '1-5', '8', '11-13'. Default: '' (all pages) */
  pageRanges?: string;
  /** Header options */
  header?: PdfHeaderFooter;
  /** Footer options */
  footer?: PdfHeaderFooter;
  /** Combined header & footer templates configuration */
  headerFooter?: {
    headerTemplate?: string;
    footerTemplate?: string;
    displayHeaderFooter?: boolean;
  };
  /** Watermark displayed across all pages */
  watermark?: PdfWatermark;
  /** Custom fonts to inject */
  fonts?: PdfFont[];
  /** Custom inline or additional CSS */
  css?: string;
  /** Document metadata */
  metadata?: PdfMetadata;
  /** Generation timeout override in milliseconds */
  timeout?: number;
  /** AbortSignal for cooperative cancellation */
  signal?: AbortSignal;
}

/**
 * Alias for GeneratePdfOptions for backwards compatibility and DX flexibility.
 */
export type PdfGenerateOptions = GeneratePdfOptions;

/**
 * Options for sending PDF over an HTTP response.
 */
export interface SendHttpOptions {
  /** 'attachment' (forces download) or 'inline' (displays in browser). Default: 'inline' */
  disposition?: 'inline' | 'attachment';
  /** Override filename for Content-Disposition header */
  filename?: string;
}

/**
 * Interface representing HTTP response object (compatible with Express and Fastify).
 */
export interface HttpResponseLike {
  setHeader?(name: string, value: string | number | readonly string[]): this | void;
  header?(name: string, value: string | number | readonly string[]): this | void;
  status?(code: number): this | void;
  code?(code: number): this | void;
  send?(body: unknown): unknown;
  end?(chunk?: unknown): unknown;
  raw?: {
    setHeader(name: string, value: string | number | readonly string[]): void;
    writeHead?(statusCode: number, headers?: Record<string, string | number>): void;
    end(chunk?: unknown): void;
  };
}

/**
 * Result returned by PdfService.generate().
 */
export interface PdfResult {
  /** The generated PDF as a raw Buffer */
  readonly buffer: Buffer;
  /** Size in bytes */
  readonly size: number;
  /** Target or default filename */
  readonly filename: string;
  /** MIME type ('application/pdf') */
  readonly mimeType: string;
  /** Metadata associated with this PDF */
  readonly metadata?: PdfMetadata;
  /** Returns the generated PDF Buffer */
  toBuffer(): Buffer;
  /** Creates a readable stream of the PDF buffer */
  stream(): Readable;
  /** Creates a readable stream of the PDF buffer (alias of stream) */
  toStream(): Readable;
  /** Saves the PDF to disk using the configured StorageAdapter */
  save(destinationPath: string): Promise<string>;
  /** Sends the PDF through an HTTP response (Express or Fastify) */
  send(response: HttpResponseLike, options?: SendHttpOptions): Promise<void>;
  /** Streams the PDF directly to an HTTP response (alias of send) */
  sendToHttp(response: HttpResponseLike, options?: SendHttpOptions): Promise<void>;
}

