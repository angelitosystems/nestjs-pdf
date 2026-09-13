import { Test, TestingModule } from '@nestjs/testing';
import { PdfModule } from '../../src/pdf/pdf.module';
import { PdfService } from '../../src/pdf/pdf.service';
import {
  ASSET_MANAGER,
  PDF_ENGINE,
  STORAGE_ADAPTER,
  TEMPLATE_ENGINE,
} from '../../src/pdf/pdf.constants';
import { AssetManager } from '../../src/assets/asset-manager';
import { HandlebarsTemplateEngine } from '../../src/templates/handlebars/handlebars.template-engine';
import { PlaywrightEngine } from '../../src/engines/playwright/playwright.engine';
import { LocalStorageAdapter } from '../../src/storage/local.storage';

describe('PdfModule (Integration)', () => {
  let moduleRef: TestingModule;

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('should compile synchronously with forRoot() and provide all dependencies', async () => {
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

    const pdfService = moduleRef.get<PdfService>(PdfService);
    const assetManager = moduleRef.get<AssetManager>(ASSET_MANAGER);
    const templateEngine = moduleRef.get<HandlebarsTemplateEngine>(TEMPLATE_ENGINE);
    const pdfEngine = moduleRef.get<PlaywrightEngine>(PDF_ENGINE);
    const storageAdapter = moduleRef.get<LocalStorageAdapter>(STORAGE_ADAPTER);

    expect(pdfService).toBeDefined();
    expect(assetManager).toBeInstanceOf(AssetManager);
    expect(templateEngine).toBeInstanceOf(HandlebarsTemplateEngine);
    expect(pdfEngine).toBeInstanceOf(PlaywrightEngine);
    expect(storageAdapter).toBeInstanceOf(LocalStorageAdapter);
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
  });
});
