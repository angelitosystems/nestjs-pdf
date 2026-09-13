import { Inject, Injectable } from '@nestjs/common';
import { TEMPLATE_ENGINE } from '../common/constants/tokens.constants';
import { TemplateEngine } from './template-engine.interface';
import { RenderTemplateOptions } from './template.types';

@Injectable()
export class TemplateService {
  constructor(
    @Inject(TEMPLATE_ENGINE)
    private readonly engine: TemplateEngine,
  ) {}

  public async render(options: RenderTemplateOptions): Promise<string> {
    return await this.engine.render(options);
  }

  public compile(templateContent: string): (data?: Record<string, unknown>) => string {
    return this.engine.compile(templateContent);
  }

  public registerHelper(name: string, fn: (...args: unknown[]) => unknown): void {
    if (this.engine.registerHelper) {
      this.engine.registerHelper(name, fn);
    }
  }

  public clearCache(): void {
    if (this.engine.clearCache) {
      this.engine.clearCache();
    }
  }

  public getEngine(): TemplateEngine {
    return this.engine;
  }
}

