import {
  PdfDimensions,
  PdfFormat,
  PdfMargins,
  PdfMetadata,
  PdfOrientation,
} from '../pdf/pdf.types';

/**
 * Options passed to the PDF Engine to generate the binary document.
 */
export interface EngineRenderOptions {
  /** Complete processed HTML document string */
  html: string;
  /** Format of the page */
  format?: PdfFormat;
  /** Custom dimensions */
  dimensions?: PdfDimensions;
  /** Page orientation */
  orientation?: PdfOrientation;
  /** Margin settings */
  margins?: PdfMargins;
  /** Print background graphics */
  printBackground?: boolean;
  /** Prefer CSS-declared page size */
  preferCSSPageSize?: boolean;
  /** Scale factor (0.1 to 2) */
  scale?: number;
  /** Page ranges */
  pageRanges?: string;
  /** Chromium header HTML template */
  headerTemplate?: string;
  /** Chromium footer HTML template */
  footerTemplate?: string;
  /** Whether to display header and footer */
  displayHeaderFooter?: boolean;
  /** Document metadata */
  metadata?: PdfMetadata;
  /** Maximum rendering timeout in milliseconds */
  timeout?: number;
  /** AbortSignal for cooperative cancellation */
  signal?: AbortSignal;
}

/**
 * Abstract interface for PDF rendering engines (Playwright, Puppeteer, PDFKit, etc.).
 */
export interface PdfEngine {
  /**
   * Renders the provided HTML string into a PDF Buffer according to options.
   */
  render(options: EngineRenderOptions): Promise<Buffer>;
}

