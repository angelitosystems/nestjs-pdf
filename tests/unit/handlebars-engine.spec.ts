import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { HandlebarsTemplateEngine } from '../../src/templates/handlebars/handlebars.template-engine';
import { PdfTemplateNotFoundError } from '../../src/pdf/pdf.exceptions';

describe('HandlebarsTemplateEngine', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-hbs-test-'));

  beforeAll(() => {
    // Create templates/invoice/template.hbs
    const invoiceDir = path.join(tempDir, 'invoice');
    fs.mkdirSync(invoiceDir, { recursive: true });
    fs.writeFileSync(
      path.join(invoiceDir, 'template.hbs'),
      '<h1>Invoice for {{customer}}</h1><p>Total: {{currency total "USD"}}</p>',
    );

    // Create simple-report.hbs
    fs.writeFileSync(
      path.join(tempDir, 'simple-report.hbs'),
      '<h2>Report: {{title}}</h2>',
    );
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should render inline template content', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir);
    const result = await engine.render({
      templateContent: '<p>Hello, {{name}}!</p>',
      data: { name: 'Angelito' },
    });

    expect(result).toBe('<p>Hello, Angelito!</p>');
  });

  it('should render directory template (template.hbs) with built-in helpers', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir);
    const result = await engine.render({
      templateName: 'invoice',
      data: { customer: 'Acme Corp', total: 1250.5 },
    });

    expect(result).toContain('<h1>Invoice for Acme Corp</h1>');
    expect(result).toContain('$1,250.50');
  });

  it('should render single-file template (name.hbs)', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir);
    const result = await engine.render({
      templateName: 'simple-report',
      data: { title: 'Q3 Financials' },
    });

    expect(result).toContain('<h2>Report: Q3 Financials</h2>');
  });

  it('should throw PdfTemplateNotFoundError when template does not exist', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir);
    await expect(
      engine.render({
        templateName: 'nonexistent-template',
        data: {},
      }),
    ).rejects.toThrow(PdfTemplateNotFoundError);
  });

  it('should support all standard helpers (date, formatNumber, uppercase, lowercase, comparisons)', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir);
    const tpl = `
      <span>Date: {{date dateVal}}</span>
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

    const html = await engine.render({
      templateContent: tpl,
      data: {
        dateVal: new Date('2026-05-15T00:00:00Z'),
        status: 'ACTIVE',
        score: 85,
        isMember: true,
        hasCredit: true,
        isVip: true,
        isStaff: false,
        isBanned: false,
      },
    });

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
    const engine = new HandlebarsTemplateEngine(tempDir, { enabled: false }, {
      helpers: {
        shout: (txt: unknown) => `${String(txt)}!!!`,
      },
    });

    const html = await engine.render({
      templateContent: '{{shout greeting}}',
      data: { greeting: 'Welcome' },
    });

    expect(html).toBe('Welcome!!!');
  });

  it('should support template caching when enabled', async () => {
    const engine = new HandlebarsTemplateEngine(tempDir, { enabled: true });

    const render1 = await engine.render({
      templateName: 'simple-report',
      data: { title: 'First Render' },
    });

    const render2 = await engine.render({
      templateName: 'simple-report',
      data: { title: 'Second Render' },
    });

    expect(render1).toContain('First Render');
    expect(render2).toContain('Second Render');

    engine.clearCache();
  });
});

