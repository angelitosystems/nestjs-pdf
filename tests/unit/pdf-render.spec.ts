import { PlaywrightPdfEngine } from '../../src/engine/playwright/playwright.engine';
import { BrowserService } from '../../src/browser/browser.service';
import { Page } from 'playwright-core';

describe('PlaywrightPdfEngine (Render features)', () => {
  let engine: PlaywrightPdfEngine;
  let mockBrowserService: jest.Mocked<BrowserService>;
  let mockPage: {
    setContent: jest.Mock;
    evaluate: jest.Mock;
    pdf: jest.Mock;
  };

  const fakePdfBuffer = Buffer.from('%PDF-1.7 rendered-test-pdf');

  beforeEach(() => {
    mockPage = {
      setContent: jest.fn().mockResolvedValue(undefined),
      evaluate: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(fakePdfBuffer),
    };

    mockBrowserService = {
      runWithPage: jest.fn().mockImplementation(async (callback: (page: Page) => Promise<Buffer>) => {
        return await callback(mockPage as unknown as Page);
      }),
    } as unknown as jest.Mocked<BrowserService>;

    engine = new PlaywrightPdfEngine(mockBrowserService);
  });

  it('should render simple HTML to PDF buffer', async () => {
    const html = '<h1>Hello World</h1><p>Simple PDF test</p>';
    const buffer = await engine.render({ html });

    expect(buffer).toBe(fakePdfBuffer);
    expect(mockPage.setContent).toHaveBeenCalledWith(html, expect.objectContaining({ waitUntil: 'load' }));
    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      }),
    );
  });

  it('should support modern CSS, Flexbox, and Grid layouts', async () => {
    const modernCssHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
            }
            .flex-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: linear-gradient(135deg, #6366f1, #a855f7);
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="grid-container">
            <div class="flex-item">Item 1</div>
            <div class="flex-item">Item 2</div>
            <div class="flex-item">Item 3</div>
          </div>
        </body>
      </html>
    `;

    const buffer = await engine.render({ html: modernCssHtml });
    expect(buffer).toBe(fakePdfBuffer);
    expect(mockPage.setContent).toHaveBeenCalledWith(modernCssHtml, expect.any(Object));
  });

  it('should support custom dimensions and orientation', async () => {
    await engine.render({
      html: '<div>Custom dimensions</div>',
      dimensions: { width: '210mm', height: '148mm' },
      orientation: 'landscape',
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        width: '210mm',
        height: '148mm',
        landscape: true,
      }),
    );
  });

  it('should support page margins, scale, and page ranges', async () => {
    await engine.render({
      html: '<div>Multi-page invoice</div>',
      margins: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      scale: 0.9,
      pageRanges: '1-3',
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        scale: 0.9,
        pageRanges: '1-3',
      }),
    );
  });

  it('should support header and footer templates with page numbers', async () => {
    const headerHtml = '<header style="font-size: 10px;">Angelito Systems Invoice</header>';
    const footerHtml = '<footer style="font-size: 9px;"><span class="pageNumber"></span> of <span class="totalPages"></span></footer>';

    await engine.render({
      html: '<div>Invoice Content</div>',
      displayHeaderFooter: true,
      headerTemplate: headerHtml,
      footerTemplate: footerHtml,
    });

    expect(mockPage.pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        displayHeaderFooter: true,
        headerTemplate: headerHtml,
        footerTemplate: footerHtml,
      }),
    );
  });
});
