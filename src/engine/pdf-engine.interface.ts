import { EngineRenderOptions } from './engine.types';

/**
 * Abstract interface for PDF rendering engines (Playwright, Puppeteer, PDFKit, etc.).
 */
export interface PdfEngine {
  /**
   * Renders the prepared HTML string into a PDF Buffer according to options.
   */
  render(options: EngineRenderOptions): Promise<Buffer>;
}
