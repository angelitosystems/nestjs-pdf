import { RenderTemplateOptions } from './template.types';

/**
 * Common contract for template engines (Handlebars, EJS, Pug, Nunjucks, etc.).
 */
export interface TemplateEngine {
  /**
   * Compiles and renders a template with the given data context.
   */
  render(options: RenderTemplateOptions): Promise<string>;

  /**
   * Compiles template string into a reusable rendering function.
   */
  compile(templateContent: string): (data?: Record<string, unknown>) => string;

  /**
   * Registers a custom helper.
   */
  registerHelper?(name: string, fn: (...args: unknown[]) => unknown): void;

  /**
   * Clears template cache.
   */
  clearCache?(): void;
}
