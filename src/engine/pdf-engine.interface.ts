import { EngineRenderOptions } from './engine.types';

/**
 * Abstract interface / base class for PDF rendering engines (Playwright, Puppeteer, PDFKit, etc.).
 */
export abstract class PdfEngine {
  /**
   * Renders the prepared HTML string into a PDF Buffer according to options.
   */
  abstract render(options: EngineRenderOptions): Promise<Buffer>;
}
