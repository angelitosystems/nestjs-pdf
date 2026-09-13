/**
 * Options for compiling and rendering a template.
 */
export interface RenderTemplateOptions {
  /** Name of the template directory or file inside templatesPath */
  templateName?: string;
  /** Direct raw template string */
  templateContent?: string;
  /** Dynamic data context */
  data?: Record<string, unknown>;
  /** Custom base directory for templates */
  templatesPath?: string;
}

/**
 * Contract for template engines (Handlebars, Pug, EJS, etc.).
 */
export interface TemplateEngine {
  /**
   * Compiles and renders a template with the provided data context.
   */
  render(options: RenderTemplateOptions): Promise<string>;

  /**
   * Compiles template string into a reusable rendering function.
   */
  compile(templateContent: string): (data?: Record<string, unknown>) => string;

  /**
   * Registers a custom template helper.
   */
  registerHelper(name: string, fn: (...args: unknown[]) => unknown): void;

  /**
   * Clears any cached compiled templates.
   */
  clearCache?(): void;
}

