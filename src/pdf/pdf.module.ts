import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import {
  PdfModuleAsyncOptions,
  PdfModuleOptions,
  PdfOptionsFactory,
} from '../common/types/pdf.types';
import { SecurityModule } from '../security/security.module';
import { AssetModule } from '../asset/asset.module';
import { TemplateModule } from '../template/template.module';
import { BrowserModule } from '../browser/browser.module';
import { EngineModule } from '../engine/engine.module';
import { StorageModule } from '../storage/storage.module';
import { QueueModule } from '../queue/queue.module';
import { RendererModule } from '../renderer/renderer.module';
import { PdfService } from './pdf.service';

@Global()
@Module({
  imports: [
    SecurityModule,
    AssetModule,
    TemplateModule,
    BrowserModule,
    EngineModule,
    StorageModule,
    QueueModule,
    RendererModule,
  ],
  providers: [PdfService],
  exports: [
    PdfService,
    RendererModule,
    EngineModule,
    TemplateModule,
    StorageModule,
    BrowserModule,
    QueueModule,
  ],
})
export class PdfModule {
  public static forRoot(options: PdfModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: PDF_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: PdfModule,
      imports: this.getDefaultImports(),
      providers: [optionsProvider, PdfService],
      exports: [
        PdfService,
        RendererModule,
        EngineModule,
        TemplateModule,
        StorageModule,
        BrowserModule,
        QueueModule,
        PDF_MODULE_OPTIONS,
      ],
    };
  }

  public static forRootAsync(asyncOptions: PdfModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(asyncOptions);

    return {
      module: PdfModule,
      imports: [...this.getDefaultImports(), ...(asyncOptions.imports || [])],
      providers: [...asyncProviders, PdfService],
      exports: [
        PdfService,
        RendererModule,
        EngineModule,
        TemplateModule,
        StorageModule,
        BrowserModule,
        QueueModule,
        PDF_MODULE_OPTIONS,
      ],
    };
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

  private static getDefaultImports() {
    return [
      SecurityModule,
      AssetModule,
      TemplateModule,
      BrowserModule,
      EngineModule,
      StorageModule,
      QueueModule,
      RendererModule,
    ];
  }
}
