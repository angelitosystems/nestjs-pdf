import { Test, TestingModule } from '@nestjs/testing';
import { PdfModule } from '../../src/pdf/pdf.module';
import { PdfService } from '../../src/pdf/pdf.service';
import {
  PDF_ENGINE,
  STORAGE_ADAPTER,
  TEMPLATE_ENGINE,
} from '../../src/common/constants/tokens.constants';
import { PdfRendererService } from '../../src/renderer/renderer.service';
import { TemplateService } from '../../src/template/template.service';
import { StorageService } from '../../src/storage/storage.service';
import { BrowserService } from '../../src/browser/browser.service';
import { ConcurrencyQueueService } from '../../src/queue/concurrency-queue.service';
import { PdfSecurityService } from '../../src/security/security.service';
import { AssetService } from '../../src/asset/asset.service';
import { PlaywrightPdfEngine } from '../../src/engine/playwright/playwright.engine';
import { LocalStorageService } from '../../src/storage/local/local-storage.service';
import { HandlebarsTemplateEngine } from '../../src/template/handlebars/handlebars.engine';
import { StorageAdapter } from '../../src/storage/storage.interface';

describe('PdfModule (Integration)', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should compile synchronously with forRoot() and register all modular providers and tokens', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PdfModule.forRoot({
          templatesPath: './templates',
          defaultFormat: 'A4',
          defaultOrientation: 'portrait',
          concurrency: 3,
          browser: { min: 0 },
        }),
      ],
    }).compile();

    // Core facade and orchestrator
    const pdfService = moduleRef.get<PdfService>(PdfService);
    const rendererService = moduleRef.get<PdfRendererService>(PdfRendererService);

    // Specialized services
    const templateService = moduleRef.get<TemplateService>(TemplateService);
    const storageService = moduleRef.get<StorageService>(StorageService);
    const browserService = moduleRef.get<BrowserService>(BrowserService);
    const queueService = moduleRef.get<ConcurrencyQueueService>(ConcurrencyQueueService);
    const securityService = moduleRef.get<PdfSecurityService>(PdfSecurityService);
    const assetService = moduleRef.get<AssetService>(AssetService);

    // Tokens
    const pdfEngine = moduleRef.get(PDF_ENGINE);
    const templateEngine = moduleRef.get(TEMPLATE_ENGINE);
    const storageAdapter = moduleRef.get(STORAGE_ADAPTER);

    expect(pdfService).toBeInstanceOf(PdfService);
    expect(rendererService).toBeInstanceOf(PdfRendererService);
    expect(templateService).toBeInstanceOf(TemplateService);
    expect(storageService).toBeInstanceOf(StorageService);
    expect(browserService).toBeInstanceOf(BrowserService);
    expect(queueService).toBeInstanceOf(ConcurrencyQueueService);
    expect(securityService).toBeInstanceOf(PdfSecurityService);
    expect(assetService).toBeInstanceOf(AssetService);

    expect(pdfEngine).toBeInstanceOf(PlaywrightPdfEngine);
    expect(templateEngine).toBeInstanceOf(HandlebarsTemplateEngine);
    expect(storageAdapter).toBeInstanceOf(LocalStorageService);
  });

  it('should compile asynchronously with forRootAsync() using useFactory', async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        PdfModule.forRootAsync({
          useFactory: async () => ({
            templatesPath: './custom-templates',
            concurrency: 2,
            cache: { enabled: true },
            browser: { min: 0 },
          }),
        }),
      ],
    }).compile();

    const pdfService = moduleRef.get<PdfService>(PdfService);
    expect(pdfService).toBeDefined();
    expect(pdfService).toBeInstanceOf(PdfService);
  });

  it('should allow overriding STORAGE_ADAPTER with a custom adapter provider', async () => {
    const customStorage: StorageAdapter = {
      save: jest.fn().mockResolvedValue('s3://my-bucket/custom.pdf'),
      exists: jest.fn().mockResolvedValue(true),
      read: jest.fn().mockResolvedValue(Buffer.from('s3 file content')),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    moduleRef = await Test.createTestingModule({
      imports: [
        PdfModule.forRoot({
          browser: { min: 0 },
        }),
      ],
    })
      .overrideProvider(STORAGE_ADAPTER)
      .useValue(customStorage)
      .compile();

    const storageService = moduleRef.get<StorageService>(StorageService);
    expect(storageService.getAdapter()).toBe(customStorage);

    const saved = await storageService.save(Buffer.from('test'), 'custom.pdf');
    expect(saved).toBe('s3://my-bucket/custom.pdf');
    expect(customStorage.save).toHaveBeenCalled();
  });
});
