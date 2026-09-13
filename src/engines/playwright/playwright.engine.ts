import { Injectable } from '@nestjs/common';
import { EngineRenderOptions, PdfEngine } from '../pdf-engine.interface';
import { BrowserManager } from '../../browser/browser-manager';
import { PdfAbortError, PdfEngineError, PdfTimeoutError } from '../../pdf/pdf.exceptions';

@Injectable()
export class PlaywrightEngine implements PdfEngine {
  constructor(private readonly browserManager: BrowserManager) {}

  public async render(options: EngineRenderOptions): Promise<Buffer> {
    const timeout = options.timeout ?? 30000;

    return await this.browserManager.runWithPage(
      async (page) => {
        try {
          // Set page content safely
          await page.setContent(options.html, {
            waitUntil: 'load',
            timeout,
          });

          // Wait for fonts to be ready inside the page context
          try {
            await page.evaluate(() => {
              if (typeof document !== 'undefined' && 'fonts' in document) {
                return (document as { fonts: { ready: Promise<unknown> } }).fonts.ready;
              }
              return Promise.resolve();
            });
          } catch {
            // Non-critical if document.fonts is unavailable
          }

          // Build Playwright PDF parameters
          const pdfParams: NonNullable<Parameters<typeof page.pdf>[0]> = {
            printBackground: options.printBackground ?? true,
            preferCSSPageSize: options.preferCSSPageSize ?? true,
            landscape: options.orientation === 'landscape',
          };

          if (options.dimensions) {
            pdfParams.width = options.dimensions.width;
            pdfParams.height = options.dimensions.height;
          } else if (options.format) {
            pdfParams.format = options.format;
          } else {
            pdfParams.format = 'A4';
          }

          if (options.margins) {
            pdfParams.margin = {
              top: options.margins.top,
              right: options.margins.right,
              bottom: options.margins.bottom,
              left: options.margins.left,
            };
          }

          if (options.scale) {
            pdfParams.scale = options.scale;
          }

          if (options.pageRanges) {
            pdfParams.pageRanges = options.pageRanges;
          }

          // Header & Footer
          const hasHeaderOrFooter =
            options.displayHeaderFooter ||
            Boolean(options.headerTemplate) ||
            Boolean(options.footerTemplate);

          if (hasHeaderOrFooter) {
            pdfParams.displayHeaderFooter = true;
            // Playwright requires valid HTML elements for header/footer templates
            pdfParams.headerTemplate =
              options.headerTemplate || '<div style="font-size: 8px;"></div>';
            pdfParams.footerTemplate =
              options.footerTemplate || '<div style="font-size: 8px;"></div>';
          }

          return await page.pdf(pdfParams);
        } catch (err: unknown) {
          if (options.signal?.aborted) {
            throw new PdfAbortError();
          }

          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('Timeout') || errMsg.includes('timed out')) {
            throw new PdfTimeoutError('Playwright rendering', timeout);
          }

          throw new PdfEngineError(
            `Playwright failed to generate PDF: ${errMsg}`,
            err instanceof Error ? err : undefined,
          );
        }
      },
      { signal: options.signal },
    );
  }
}
