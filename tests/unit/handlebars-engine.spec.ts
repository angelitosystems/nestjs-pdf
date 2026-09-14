import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { HandlebarsTemplateEngine } from '../../src/template/handlebars/handlebars.engine';
import { TemplateService } from '../../src/template/template.service';
import { PdfSecurityService } from '../../src/security/security.service';
import { PdfTemplateNotFoundError } from '../../src/common/exceptions/pdf.exceptions';

describe('HandlebarsTemplateEngine & TemplateService', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-hbs-test-'));

  beforeAll(() => {
    const invoiceDir = path.join(tempDir, 'invoice');
    fs.mkdirSync(invoiceDir, { recursive: true });
    fs.writeFileSync(
      path.join(invoiceDir, 'template.hbs'),
      '<h1>Invoice for {{customer}}</h1><p>Total: {{currency total "USD"}}</p>',
    );

    fs.writeFileSync(
      path.join(tempDir, 'simple-report.hbs'),
      '<h2>Report: {{title}}</h2>',
    );
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createEngine = (cacheEnabled = false, customHelpers?: Record<string, (...args: unknown[]) => unknown>) => {
    const secService = new PdfSecurityService({ templatesPath: tempDir });
    return new HandlebarsTemplateEngine(secService, {
      templatesPath: tempDir,
      cache: { enabled: cacheEnabled },
      handlebars: { helpers: customHelpers },
    });
  };

  it('should render inline template content', async () => {
    const engine = createEngine();
    const service = new TemplateService(engine);
    const result = await service.render({
      templateContent: '<p>Hello, {{name}}!</p>',
      data: { name: 'Angelito' },
    });

    expect(result).toBe('<p>Hello, Angelito!</p>');
  });

  it('should render directory template (template.hbs) with built-in helpers', async () => {
    const engine = createEngine();
    const service = new TemplateService(engine);
    const result = await service.render({
      templateName: 'invoice',
      data: { customer: 'Acme Corp', total: 1250.5 },
    });

    expect(result).toContain('<h1>Invoice for Acme Corp</h1>');
    expect(result).toContain('$1,250.50');
  });

  it('should render single-file template (name.hbs)', async () => {
    const engine = createEngine();
    const service = new TemplateService(engine);
    const result = await service.render({
      templateName: 'simple-report',
      data: { title: 'Q3 Financials' },
    });

    expect(result).toContain('<h2>Report: Q3 Financials</h2>');
  });

  it('should throw PdfTemplateNotFoundError when template does not exist', async () => {
    const engine = createEngine();
    const service = new TemplateService(engine);
    await expect(
      service.render({
        templateName: 'nonexistent-template',
        data: {},
      }),
    ).rejects.toThrow(PdfTemplateNotFoundError);
  });

  it('should support all standard helpers', async () => {
    const engine = createEngine();
    const service = new TemplateService(engine);
    const tpl = `
      <span>Date: {{date dateVal}}</span>
      <span>FormatDate: {{formatDate dateVal "YYYY-MM-DD"}}</span>
      <span>Default: {{default note "N/A"}}</span>
      <span>Json: {{{json userObj}}}</span>
      <span>Num: {{formatNumber 1234.5678 2}}</span>
      <span>Upper: {{uppercase "hello"}}</span>
      <span>Lower: {{lowercase "WORLD"}}</span>
      {{#if (eq status "ACTIVE")}}Status is active{{/if}}
      {{#if (ne status "INACTIVE")}}Status not inactive{{/if}}
      {{#if (gt score 50)}}Passed{{/if}}
      {{#if (gte score 80)}}Distinction{{/if}}
      {{#if (lt score 90)}}Below 90{{/if}}
      {{#if (lte score 85)}}Below or equal 85{{/if}}
      {{#if (and isMember hasCredit)}}Can purchase{{/if}}
      {{#if (or isVip isStaff)}}Access granted{{/if}}
      {{#if (not isBanned)}}Not banned{{/if}}
    `;

    const html = await service.render({
      templateContent: tpl,
      data: {
        dateVal: new Date('2026-05-15T12:00:00Z'),
        note: null,
        userObj: { id: 1 },
        status: 'ACTIVE',
        score: 85,
        isMember: true,
        hasCredit: true,
        isVip: true,
        isStaff: false,
        isBanned: false,
      },
    });

    expect(html).toContain('FormatDate: 2026-05-15');
    expect(html).toContain('Default: N/A');
    expect(html).toContain('Json: {"id":1}');
    expect(html).toContain('Num: 1,234.57');
    expect(html).toContain('Upper: HELLO');
    expect(html).toContain('Lower: world');
    expect(html).toContain('Status is active');
    expect(html).toContain('Status not inactive');
    expect(html).toContain('Passed');
    expect(html).toContain('Distinction');
    expect(html).toContain('Below 90');
    expect(html).toContain('Below or equal 85');
    expect(html).toContain('Can purchase');
    expect(html).toContain('Access granted');
    expect(html).toContain('Not banned');
  });

  it('should allow registering custom helpers', async () => {
    const engine = createEngine(false, {
      shout: (txt: unknown) => `${String(txt)}!!!`,
    });
    const service = new TemplateService(engine);

    const html = await service.render({
      templateContent: '{{shout greeting}}',
      data: { greeting: 'Welcome' },
    });

    expect(html).toBe('Welcome!!!');
  });

  it('should support template caching when enabled', async () => {
    const engine = createEngine(true);
    const service = new TemplateService(engine);

    const render1 = await service.render({
      templateName: 'simple-report',
      data: { title: 'First Render' },
    });

    const render2 = await service.render({
      templateName: 'simple-report',
      data: { title: 'Second Render' },
    });

    expect(render1).toContain('First Render');
    expect(render2).toContain('Second Render');

    service.clearCache();
  });
});
