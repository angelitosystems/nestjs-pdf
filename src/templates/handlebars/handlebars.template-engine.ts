import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { Injectable } from '@nestjs/common';
import { TemplateEngine, RenderTemplateOptions } from '../template-engine.interface';
import { defaultHandlebarsHelpers } from './handlebars.helpers';
import { PdfCacheOptions, HandlebarsConfig } from '../../pdf/pdf.types';
import { PdfRenderingError, PdfTemplateNotFoundError } from '../../pdf/pdf.exceptions';
import { SecurityUtils } from '../../utils/security.utils';

/**
 * Handlebars-based implementation of TemplateEngine with caching, security checks, and safe helpers.
 */
@Injectable()
export class HandlebarsTemplateEngine implements TemplateEngine {
  private readonly hbs: typeof Handlebars;
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(
    private readonly defaultTemplatesPath: string = './templates',
    private readonly cacheOptions: PdfCacheOptions = { enabled: false },
    handlebarsConfig?: HandlebarsConfig,
  ) {
    this.hbs = Handlebars.create();

    // Register built-in safe helpers
    for (const [name, helper] of Object.entries(defaultHandlebarsHelpers)) {
      this.hbs.registerHelper(name, helper);
    }

    // Register user custom helpers if provided
    if (handlebarsConfig?.helpers) {
      for (const [name, helper] of Object.entries(handlebarsConfig.helpers)) {
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

    // Cache lookup
    if (this.cacheOptions.enabled && this.cache.has(cacheKey)) {
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

    // Resolve template file
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

    if (this.cacheOptions.enabled) {
      if (this.cacheOptions.maxItems && this.cache.size >= this.cacheOptions.maxItems) {
        // Evict oldest entry (simple LRU/FIFO map eviction)
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

  /**
   * Locates the template file inside the basePath with path traversal protection.
   */
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
        // Validate path traversal
        const safeCandidate = SecurityUtils.validatePathTraversal(candidate, [basePath]);
        searchPaths.push(safeCandidate);
        if (fs.existsSync(safeCandidate) && fs.statSync(safeCandidate).isFile()) {
          return safeCandidate;
        }
      } catch {
        // Ignored candidate if outside allowed directory
      }
    }

    throw new PdfTemplateNotFoundError(templateName, candidates);
  }
}

