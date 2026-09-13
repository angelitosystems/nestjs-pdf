import { Injectable } from '@nestjs/common';
import { PdfEngine } from '../pdf-engine.interface';
import { EngineRenderOptions } from '../engine.types';
import { BrowserService } from '../../browser/browser.service';
import { PdfAbortError, PdfEngineError, PdfTimeoutError } from '../../common/exceptions/pdf.exceptions';

@Injectable()
export class PlaywrightPdfEngine implements PdfEngine {
  constructor(private readonly browserService: BrowserService) {}

  public async render(options: EngineRenderOptions): Promise<Buffer> {
    const timeout = options.timeout ?? 30000;

    return await this.browserService.runWithPage(
      async (page) => {
        try {
          await page.setContent(options.html, {
            waitUntil: 'load',
            timeout,
          });

          try {
            await page.evaluate(() => {
              if (typeof document !== 'undefined' && 'fonts' in document) {
                return (document as { fonts: { ready: Promise<unknown> } }).fonts.ready;
              }
              return Promise.resolve();
            });
          } catch {
            // Non-critical if document.fonts is not supported
          }

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

          const hasHeaderOrFooter =
            options.displayHeaderFooter ||
            Boolean(options.headerTemplate) ||
            Boolean(options.footerTemplate);

          if (hasHeaderOrFooter) {
            pdfParams.displayHeaderFooter = true;
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

