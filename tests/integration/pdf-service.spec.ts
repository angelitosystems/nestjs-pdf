import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from '../../src/pdf/pdf.service';
import { RendererService } from '../../src/rendering/renderer.service';
import {
  ASSET_MANAGER,
  PDF_ENGINE,
  PDF_MODULE_OPTIONS,
  STORAGE_ADAPTER,
  TEMPLATE_ENGINE,
} from '../../src/pdf/pdf.constants';
import { EngineRenderOptions, PdfEngine } from '../../src/engines/pdf-engine.interface';
import { HandlebarsTemplateEngine } from '../../src/templates/handlebars/handlebars.template-engine';
import { AssetManager } from '../../src/assets/asset-manager';
import { LocalStorageAdapter } from '../../src/storage/local.storage';
import { PdfAbortError } from '../../src/pdf/pdf.exceptions';
import { PdfEvent } from '../../src/pdf/pdf.types';

describe('PdfService (Integration)', () => {
  let pdfService: PdfService;
  let mockEngine: jest.Mocked<PdfEngine>;
  let capturedRenderOptions: EngineRenderOptions | undefined;
  const capturedEvents: PdfEvent[] = [];

  const fakePdfBuffer = Buffer.from('%PDF-1.4 mock binary');

  beforeEach(async () => {
    capturedEvents.length = 0;
    capturedRenderOptions = undefined;

    mockEngine = {
      render: jest.fn().mockImplementation(async (opts: EngineRenderOptions) => {
        capturedRenderOptions = opts;
        // Simulate a small render delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        return fakePdfBuffer;
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PDF_MODULE_OPTIONS,
          useValue: {
            templatesPath: './templates',
            defaultFormat: 'A4',
            concurrency: 2,
            onEvent: (evt: PdfEvent) => capturedEvents.push(evt),
          },
        },
        {
          provide: ASSET_MANAGER,
          useFactory: () => new AssetManager(),
        },
        {
          provide: TEMPLATE_ENGINE,
          useFactory: () => new HandlebarsTemplateEngine(),
        },
        {
          provide: STORAGE_ADAPTER,
          useFactory: () => new LocalStorageAdapter(),
        },
        {
          provide: PDF_ENGINE,
          useValue: mockEngine,
        },
        RendererService,
        PdfService,
      ],
    }).compile();

    pdfService = moduleRef.get<PdfService>(PdfService);
  });

  it('should generate a PDF and return a valid PdfResult', async () => {
    const result = await pdfService.generate({
      html: '<h1>Invoice #{{invNum}}</h1><p>Amount: {{currency amount "EUR"}}</p>',
      data: { invNum: 'INV-2026-001', amount: 500 },
      filename: 'custom-invoice.pdf',
      format: 'A4',
      orientation: 'portrait',
      metadata: {
        title: 'Invoice 2026',
        author: 'Angelito Systems',
      },
    });

    expect(result).toBeDefined();
    expect(result.filename).toBe('custom-invoice.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.size).toBe(fakePdfBuffer.length);
    expect(result.buffer.equals(fakePdfBuffer)).toBe(true);

    // Verify engine was called with compiled HTML
    expect(mockEngine.render).toHaveBeenCalled();
    expect(capturedRenderOptions).toBeDefined();
    expect(capturedRenderOptions?.html).toContain('Invoice #INV-2026-001');
    expect(capturedRenderOptions?.html).toContain('500.00');
    expect(capturedRenderOptions?.format).toBe('A4');
    expect(capturedRenderOptions?.orientation).toBe('portrait');

    // Verify events were emitted
    const eventTypes = capturedEvents.map((e) => e.type);
    expect(eventTypes).toContain('generation.started');
    expect(eventTypes).toContain('generation.completed');
  });

  it('should inject watermark and header/footer with page numbers correctly', async () => {
    await pdfService.generate({
      html: '<div>Confidential Document Body</div>',
      watermark: {
        text: 'INTERNAL ONLY',
        opacity: 0.2,
        rotate: -30,
      },
      footer: {
        pageNumbers: true,
      },
    });

    expect(capturedRenderOptions).toBeDefined();
    expect(capturedRenderOptions?.html).toContain('INTERNAL ONLY');
    expect(capturedRenderOptions?.html).toContain('pdf-watermark-overlay');
    expect(capturedRenderOptions?.displayHeaderFooter).toBe(true);
    expect(capturedRenderOptions?.footerTemplate).toContain('class="pageNumber"');
    expect(capturedRenderOptions?.footerTemplate).toContain('class="totalPages"');
  });

  it('should cancel generation and throw PdfAbortError when signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      pdfService.generate({
        html: '<p>Never renders</p>',
        signal: controller.signal,
      }),
    ).rejects.toThrow(PdfAbortError);
  });
});

