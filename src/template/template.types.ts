export interface RenderTemplateOptions {
  templateName?: string;
  templateContent?: string;
  data?: Record<string, unknown>;
  templatesPath?: string;
}

export interface CompiledTemplate {
  (data?: Record<string, unknown>): string;
}

