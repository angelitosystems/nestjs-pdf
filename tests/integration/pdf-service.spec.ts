import { Test, TestingModule } from '@nestjs/testing';
import { PdfModule } from '../../src/pdf/pdf.module';
import { PdfService } from '../../src/pdf/pdf.service';
import { PDF_ENGINE } from '../../src/common/constants/tokens.constants';
import { PdfEngine } from '../../src/engine/pdf-engine.interface';
import { EngineRenderOptions } from '../../src/engine/engine.types';
import { PdfAbortError } from '../../src/common/exceptions/pdf.exceptions';
import { PdfEvent } from '../../src/common/types/pdf.types';

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
        await new Promise((resolve) => setTimeout(resolve, 10));
        return fakePdfBuffer;
      }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PdfModule.forRoot({
          templatesPath: './templates',
          defaultFormat: 'A4',
          concurrency: 2,
          browser: { min: 0 },
          onEvent: (evt: PdfEvent) => capturedEvents.push(evt),
        }),
      ],
    })
      .overrideProvider(PDF_ENGINE)
      .useValue(mockEngine)
      .compile();

    pdfService = moduleRef.get<PdfService>(PdfService);
  });

  it('should generate a PDF and return a valid PdfResult through facade and modular pipeline', async () => {
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

    expect(mockEngine.render).toHaveBeenCalled();
    expect(capturedRenderOptions).toBeDefined();
    expect(capturedRenderOptions?.html).toContain('Invoice #INV-2026-001');
    expect(capturedRenderOptions?.html).toContain('500.00');
    expect(capturedRenderOptions?.format).toBe('A4');
    expect(capturedRenderOptions?.orientation).toBe('portrait');

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
