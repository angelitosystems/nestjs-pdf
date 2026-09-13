import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { TEMPLATE_ENGINE, PDF_ENGINE, PDF_MODULE_OPTIONS, ASSET_MANAGER } from '../pdf/pdf.constants';
import { TemplateEngine } from '../templates/template-engine.interface';
import { PdfEngine } from '../engines/pdf-engine.interface';
import { AssetManager } from '../assets/asset-manager';
import { GeneratePdfOptions, PdfHeaderFooter, PdfModuleOptions, PdfWatermark } from '../pdf/pdf.types';
import { PdfRenderingError } from '../pdf/pdf.exceptions';

@Injectable()
export class RendererService {
  constructor(
    @Inject(TEMPLATE_ENGINE)
    private readonly templateEngine: TemplateEngine,
    @Inject(PDF_ENGINE)
    private readonly pdfEngine: PdfEngine,
    @Inject(ASSET_MANAGER)
    private readonly assetManager: AssetManager,
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    private readonly moduleOptions: PdfModuleOptions = {},
  ) {}

  /**
   * Orchestrates the complete pipeline: templates, CSS, assets, fonts, watermark, headers/footers, and engine rendering.
   */
  public async renderPdf(options: GeneratePdfOptions): Promise<Buffer> {
    const templatesBasePath = path.resolve(this.moduleOptions.templatesPath || './templates');
    let templateDir: string | undefined;

    // 1. Resolve HTML content
    let htmlContent: string;
    if (options.html) {
      if (options.data && Object.keys(options.data).length > 0) {
        htmlContent = await this.templateEngine.render({
          templateContent: options.html,
          data: options.data,
        });
      } else {
        htmlContent = options.html;
      }
    } else if (options.template) {
      const templateName = options.template;
      const candidateDir = path.join(templatesBasePath, templateName);
      if (fs.existsSync(candidateDir) && fs.statSync(candidateDir).isDirectory()) {
        templateDir = candidateDir;
      } else {
        templateDir = templatesBasePath;
      }

      htmlContent = await this.templateEngine.render({
        templateName,
        data: options.data,
        templatesPath: templatesBasePath,
      });
    } else {
      throw new PdfRenderingError('Either "template" or "html" must be provided in PDF options');
    }

    // 2. Gather Stylesheets
    const styles: string[] = [];

    // Base template styles.css if existing
    if (templateDir) {
      const cssPath = path.join(templateDir, 'styles.css');
      if (fs.existsSync(cssPath)) {
        try {
          const cssContent = await fs.promises.readFile(cssPath, 'utf-8');
          styles.push(cssContent);
        } catch {
          // Continue if unreadable
        }
      }
    }

    // Custom fonts
    if (options.fonts && options.fonts.length > 0) {
      for (const font of options.fonts) {
        const fontCss = await this.assetManager.resolveFont(font, templateDir);
        styles.push(fontCss);
      }
    }

    // Additional custom CSS
    if (options.css) {
      styles.push(options.css);
    }

    // Watermark CSS and element
    let watermarkHtml = '';
    if (options.watermark) {
      const { css, html } = this.buildWatermark(options.watermark);
      styles.push(css);
      watermarkHtml = html;
    }

    // Standard print CSS rules for clean page breaks
    styles.push(`
      @media print {
        .page-break-before { page-break-before: always; }
        .page-break-after { page-break-after: always; }
        .page-break-inside-avoid, .avoid-break { page-break-inside: avoid; }
      }
    `);

    // 3. Assemble complete HTML document
    const fullHtml = this.assembleDocument(htmlContent, styles.join('\n'), watermarkHtml);

    // 4. Process Header and Footer templates
    const headerTemplate = await this.buildHeaderFooterHtml(
      options.header,
      options.data,
      templatesBasePath,
      'header',
    );
    const footerTemplate = await this.buildHeaderFooterHtml(
      options.footer,
      options.data,
      templatesBasePath,
      'footer',
    );

    // 5. Send to PDF Engine
    return await this.pdfEngine.render({
      html: fullHtml,
      format: options.format || this.moduleOptions.defaultFormat || 'A4',
      dimensions: options.dimensions,
      orientation: options.orientation || this.moduleOptions.defaultOrientation || 'portrait',
      margins: options.margins || this.moduleOptions.defaultMargins,
      printBackground: options.printBackground ?? true,
      preferCSSPageSize: options.preferCSSPageSize ?? true,
      scale: options.scale,
      pageRanges: options.pageRanges,
      headerTemplate,
      footerTemplate,
      displayHeaderFooter: Boolean(headerTemplate || footerTemplate),
      metadata: options.metadata,
      timeout: options.timeout || this.moduleOptions.timeout,
      signal: options.signal,
    });
  }

  private assembleDocument(content: string, css: string, watermarkHtml: string): string {
    // If user provided a complete document with <html> and <body>, inject styles and watermark
    if (/<html[\s\S]*>/i.test(content)) {
      let result = content;
      if (css.trim()) {
        const styleTag = `<style>\n${css}\n</style>`;
        if (/<head[\s\S]*>/i.test(result)) {
          result = result.replace(/<\/head>/i, `${styleTag}\n</head>`);
        } else {
          result = `${styleTag}\n${result}`;
        }
      }
      if (watermarkHtml) {
        if (/<body[\s\S]*>/i.test(result)) {
          result = result.replace(/<body([^>]*)>/i, `<body$1>\n${watermarkHtml}`);
        } else {
          result = `${watermarkHtml}\n${result}`;
        }
      }
      return result;
    }

    // Otherwise wrap content into a standard HTML5 structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${css}
  </style>
</head>
<body>
  ${watermarkHtml}
  ${content}
</body>
</html>`;
  }

  private buildWatermark(watermark: PdfWatermark): { css: string; html: string } {
    const opacity = watermark.opacity ?? 0.15;
    const rotate = watermark.rotate ?? -45;
    const fontSize = watermark.fontSize ?? '72px';
    const color = watermark.color ?? '#000000';

    const css = `
      .pdf-watermark-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 999999;
        opacity: ${opacity};
        transform: rotate(${rotate}deg);
        font-family: sans-serif;
        font-weight: bold;
        font-size: ${fontSize};
        color: ${color};
        text-transform: uppercase;
        user-select: none;
      }
    `;

    const html = `<div class="pdf-watermark-overlay">${this.escapeHtml(watermark.text)}</div>`;
    return { css, html };
  }

  private async buildHeaderFooterHtml(
    config: PdfHeaderFooter | undefined,
    parentData: Record<string, unknown> | undefined,
    templatesPath: string,
    _type: 'header' | 'footer',
  ): Promise<string | undefined> {
    if (!config) return undefined;

    let content = '';

    if (config.html) {
      content = config.html;
    } else if (config.template) {
      content = await this.templateEngine.render({
        templateName: config.template,
        data: { ...parentData, ...config.data },
        templatesPath,
      });
    } else if (config.pageNumbers) {
      content =
        '<div style="font-size: 9px; width: 100%; text-align: center; color: #777;">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>';
    }

    // Convert Handlebars-style {{pageNumber}} & {{totalPages}} to Chromium's native span classes
    content = content
      .replace(/{{\s*pageNumber\s*}}/g, '<span class="pageNumber"></span>')
      .replace(/{{\s*totalPages\s*}}/g, '<span class="totalPages"></span>');

    if (!content.trim()) {
      return undefined;
    }

    // Chromium header/footer requires font-size and margin in template or it defaults to unstyled tiny text
    return `
      <div style="font-size: 10px; width: 100%; margin: 0 15mm; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact;">
        ${content}
      </div>
    `;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
