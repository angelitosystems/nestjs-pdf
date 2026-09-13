import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import {
  ASSET_MANAGER,
  BROWSER_MANAGER,
  PDF_ENGINE,
  PDF_MODULE_OPTIONS,
  STORAGE_ADAPTER,
  TEMPLATE_ENGINE,
} from './pdf.constants';
import {
  PdfModuleAsyncOptions,
  PdfModuleOptions,
  PdfOptionsFactory,
} from './pdf.types';
import { PdfService } from './pdf.service';
import { RendererService } from '../rendering/renderer.service';
import { AssetManager } from '../assets/asset-manager';
import { HandlebarsTemplateEngine } from '../templates/handlebars/handlebars.template-engine';
import { BrowserManager } from '../browser/browser-manager';
import { PlaywrightEngine } from '../engines/playwright/playwright.engine';
import { LocalStorageAdapter } from '../storage/local.storage';

@Global()
@Module({})
export class PdfModule {
  /**
   * Synchronously configure the PDF module.
   */
  public static forRoot(options: PdfModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: PDF_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: PdfModule,
      providers: [
        optionsProvider,
        ...this.createCoreProviders(),
      ],
      exports: [
        PdfService,
        RendererService,
        PDF_ENGINE,
        TEMPLATE_ENGINE,
        STORAGE_ADAPTER,
        ASSET_MANAGER,
      ],
    };
  }

  /**
   * Asynchronously configure the PDF module using useFactory, useClass, or useExisting.
   */
  public static forRootAsync(asyncOptions: PdfModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(asyncOptions);

    return {
      module: PdfModule,
      imports: asyncOptions.imports || [],
      providers: [
        ...asyncProviders,
        ...this.createCoreProviders(),
      ],
      exports: [
        PdfService,
        RendererService,
        PDF_ENGINE,
        TEMPLATE_ENGINE,
        STORAGE_ADAPTER,
        ASSET_MANAGER,
      ],
    };
  }

  private static createCoreProviders(): Provider[] {
    return [
      {
        provide: ASSET_MANAGER,
        inject: [PDF_MODULE_OPTIONS],
        useFactory: (opts: PdfModuleOptions) =>
          new AssetManager(opts.security, opts.templatesPath),
      },
      {
        provide: TEMPLATE_ENGINE,
        inject: [PDF_MODULE_OPTIONS],
        useFactory: (opts: PdfModuleOptions) =>
          new HandlebarsTemplateEngine(opts.templatesPath, opts.cache, opts.handlebars),
      },
      {
        provide: BROWSER_MANAGER,
        inject: [PDF_MODULE_OPTIONS],
        useFactory: (opts: PdfModuleOptions) => new BrowserManager(opts),
      },
      {
        provide: PDF_ENGINE,
        inject: [BROWSER_MANAGER],
        useFactory: (bm: BrowserManager) => new PlaywrightEngine(bm),
      },
      {
        provide: STORAGE_ADAPTER,
        useFactory: () => new LocalStorageAdapter(),
      },
      RendererService,
      PdfService,
    ];
  }

  private static createAsyncProviders(options: PdfModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: PDF_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useExisting || options.useClass) {
      const target = (options.useClass || options.useExisting) as Type<PdfOptionsFactory>;
      return [
        {
          provide: PDF_MODULE_OPTIONS,
          useFactory: async (optionsFactory: PdfOptionsFactory) =>
            await optionsFactory.createPdfOptions(),
          inject: [target],
        },
        ...(options.useClass
          ? [
              {
                provide: target,
                useClass: options.useClass,
              },
            ]
          : []),
      ];
    }

    return [
      {
        provide: PDF_MODULE_OPTIONS,
        useValue: {},
      },
    ];
  }
}
