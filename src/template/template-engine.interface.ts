import { RenderTemplateOptions } from './template.types';

/**
 * Common contract / abstract base class for template engines (Handlebars, EJS, Pug, Nunjucks, etc.).
 */
export abstract class TemplateEngine {
  /**
   * Compiles and renders a template with the given data context.
   */
  abstract render(options: RenderTemplateOptions): Promise<string>;

  /**
   * Compiles template string into a reusable rendering function.
   */
  abstract compile(templateContent: string): (data?: Record<string, unknown>) => string;

  /**
   * Registers a custom helper.
   */
  abstract registerHelper?(name: string, fn: (...args: unknown[]) => unknown): void;

  /**
   * Clears template cache.
   */
  abstract clearCache?(): void;
}
