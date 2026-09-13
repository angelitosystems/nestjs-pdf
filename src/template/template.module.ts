import { Module } from '@nestjs/common';
import { TEMPLATE_ENGINE } from '../common/constants/tokens.constants';
import { SecurityModule } from '../security/security.module';
import { HandlebarsTemplateEngine } from './handlebars/handlebars.engine';
import { TemplateService } from './template.service';

@Module({
  imports: [SecurityModule],
  providers: [
    HandlebarsTemplateEngine,
    {
      provide: TEMPLATE_ENGINE,
      useExisting: HandlebarsTemplateEngine,
    },
    TemplateService,
  ],
  exports: [TemplateService, TEMPLATE_ENGINE, HandlebarsTemplateEngine],
})
export class TemplateModule {}
