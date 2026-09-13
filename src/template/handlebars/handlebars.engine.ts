import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { TemplateEngine } from '../template-engine.interface';
import { RenderTemplateOptions } from '../template.types';
import { defaultHandlebarsHelpers } from './handlebars.helpers';
import { PDF_MODULE_OPTIONS } from '../../common/constants/tokens.constants';
import type { PdfCacheOptions, PdfModuleOptions } from '../../common/types/pdf.types';
import { PdfRenderingError, PdfTemplateNotFoundError } from '../../common/exceptions/pdf.exceptions';
import { PdfSecurityService } from '../../security/security.service';

@Injectable()
export class HandlebarsTemplateEngine implements TemplateEngine {
  private readonly hbs: typeof Handlebars;
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();
  private readonly defaultTemplatesPath: string;
  private readonly cacheConfig: PdfCacheOptions;

  constructor(
    private readonly securityService: PdfSecurityService,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    moduleOptions?: PdfModuleOptions,
  ) {
    this.hbs = Handlebars.create();
    this.defaultTemplatesPath = moduleOptions?.templatesPath || './templates';
    this.cacheConfig = moduleOptions?.cache || { enabled: false };

    // Register built-in helpers
    for (const [name, helper] of Object.entries(defaultHandlebarsHelpers)) {
      this.hbs.registerHelper(name, helper);
    }

    // Register custom user helpers
    const customHelpers = moduleOptions?.handlebars?.helpers;
    if (customHelpers) {
      for (const [name, helper] of Object.entries(customHelpers)) {
        this.hbs.registerHelper(name, helper);
      }
    }
  }

  public registerHelper(name: string, fn: (...args: unknown[]) => unknown): void {
    this.hbs.registerHelper(name, fn);
  }

  public compile(templateContent: string): (data?: Record<string, unknown>) => string {
    try {
      return this.hbs.compile(templateContent, {
        noEscape: false,
        strict: false,
        preventIndent: true,
      });
    } catch (err) {
      throw new PdfRenderingError(
        `Failed to compile template content: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err : undefined,
      );
    }
  }

  public async render(options: RenderTemplateOptions): Promise<string> {
    const { templateName, templateContent, data, templatesPath } = options;

    if (templateContent) {
      const compiled = this.compile(templateContent);
      try {
        return compiled(data || {});
      } catch (err) {
        throw new PdfRenderingError(
          `Failed to render inline template content: ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err : undefined,
        );
      }
    }

    if (!templateName) {
      throw new PdfRenderingError('Either templateName or templateContent must be provided');
    }

    const basePath = path.resolve(templatesPath || this.defaultTemplatesPath);
    const cacheKey = `${basePath}:${templateName}`;

    if (this.cacheConfig.enabled && this.cache.has(cacheKey)) {
      const cachedFn = this.cache.get(cacheKey)!;
      try {
        return cachedFn(data || {});
      } catch (err) {
        throw new PdfRenderingError(
          `Failed to render cached template "${templateName}": ${err instanceof Error ? err.message : String(err)}`,
          err instanceof Error ? err : undefined,
        );
      }
    }

    const templateFilePath = this.resolveTemplateFile(templateName, basePath);
    let rawContent: string;
    try {
      rawContent = await fs.promises.readFile(templateFilePath, 'utf-8');
    } catch (err) {
      throw new PdfRenderingError(
        `Failed to read template file at "${templateFilePath}": ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err : undefined,
      );
    }

    const compiledFn = this.compile(rawContent);

    if (this.cacheConfig.enabled) {
      if (this.cacheConfig.maxItems && this.cache.size >= this.cacheConfig.maxItems) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) this.cache.delete(firstKey);
      }
      this.cache.set(cacheKey, compiledFn);
    }

    try {
      return compiledFn(data || {});
    } catch (err) {
      throw new PdfRenderingError(
        `Failed to render template "${templateName}": ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err : undefined,
      );
    }
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public resolveTemplateFile(templateName: string, basePath: string): string {
    const candidates = [
      path.join(basePath, templateName, 'template.hbs'),
      path.join(basePath, templateName, 'index.hbs'),
      path.join(basePath, `${templateName}.hbs`),
      path.join(basePath, templateName),
    ];

    const searchPaths: string[] = [];

    for (const candidate of candidates) {
      try {
        const safeCandidate = this.securityService.validatePath(candidate, [basePath]);
        searchPaths.push(safeCandidate);
        if (fs.existsSync(safeCandidate) && fs.statSync(safeCandidate).isFile()) {
          return safeCandidate;
        }
      } catch {
        // Continue searching
      }
    }

    throw new PdfTemplateNotFoundError(templateName, candidates);
  }
}

