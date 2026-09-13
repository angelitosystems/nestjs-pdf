import { Module } from '@nestjs/common';
import { PDF_ENGINE } from '../common/constants/tokens.constants';
import { BrowserModule } from '../browser/browser.module';
import { PlaywrightPdfEngine } from './playwright/playwright.engine';
import { PdfEngineService } from './pdf-engine.service';

@Module({
  imports: [BrowserModule],
  providers: [
    PlaywrightPdfEngine,
    {
      provide: PDF_ENGINE,
      useExisting: PlaywrightPdfEngine,
    },
    PdfEngineService,
  ],
  exports: [PDF_ENGINE, PdfEngineService, PlaywrightPdfEngine],
})
export class EngineModule {}
