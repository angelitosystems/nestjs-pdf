import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { CheckCircle2 } from 'lucide-react';

export function QuickStartSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Inicio Rápido (5 Minutos)' : 'Quick Start (5 Minutes)'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Sigue esta guía paso a paso para configurar tu primer endpoint de generación de PDF en NestJS en menos de 5 minutos.'
            : 'Follow this step-by-step walkthrough to set up your first PDF generation endpoint in NestJS in under 5 minutes.'}
        </p>
      </div>

      {/* Step 1 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-rose-500/30">
            1
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {locale === 'es' ? 'Registrar PdfModule en tu AppModule' : 'Register PdfModule in your AppModule'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-10">
          {locale === 'es'
            ? 'Importa PdfModule.forRoot() en el módulo raíz de tu aplicación y define el directorio de plantillas.'
            : 'Import PdfModule.forRoot() in your root application module and specify your templates folder.'}
        </p>
        <div className="pl-10">
          <CodeBlock
            filename="src/app.module.ts"
            code={`import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      browser: {
        min: 1,
        max: 3,
        maxOperationsPerBrowser: 50,
      },
      concurrency: {
        limit: 5,
        queueTimeout: 20000,
      },
    }),
  ],
  controllers: [InvoiceController],
})
export class AppModule {}`}
          />
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-rose-500/30">
            2
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {locale === 'es' ? 'Crear la plantilla Handlebars' : 'Create the Handlebars Template'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-10">
          {locale === 'es'
            ? 'Crea un archivo en ./templates/invoice/template.hbs (o ./templates/invoice.hbs). Puedes usar CSS moderno y helpers integrados como currency o formatDate.'
            : 'Create a template at ./templates/invoice/template.hbs (or ./templates/invoice.hbs). You can use modern CSS and built-in helpers like currency and formatDate.'}
        </p>
        <div className="pl-10">
          <CodeBlock
            language="html"
            filename="templates/invoice/template.hbs"
            code={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #e0234e;
      padding-bottom: 12px;
    }
    .total-box {
      margin-top: 30px;
      text-align: right;
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>INVOICE #{{invoiceNumber}}</h1>
    <p>Date: {{formatDate createdAt "YYYY-MM-DD"}}</p>
  </div>

  <h2>Billed To: {{customerName}}</h2>

  <div class="total-box">
    Total Amount: {{currency amount "USD"}}
  </div>
</body>
</html>`}
          />
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-rose-500/30">
            3
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {locale === 'es' ? 'Inyectar PdfService y enviar respuesta HTTP' : 'Inject PdfService & Stream HTTP Response'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-10">
          {locale === 'es'
            ? 'Inyecta PdfService en tu controlador y llama a generate(). El objeto PdfResult incluye sendToHttp() para transmitir directamente a Express o Fastify.'
            : 'Inject PdfService into your controller and call generate(). The returned PdfResult provides sendToHttp() to stream directly to Express or Fastify.'}
        </p>
        <div className="pl-10">
          <CodeBlock
            filename="src/invoice.controller.ts"
            code={`import { Controller, Get, Param, Res } from '@nestjs/common';
import { PdfService } from '@angelitosystems/nestjs-pdf';
import type { Response } from 'express';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly pdfService: PdfService) {}

  @Get(':id/download')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.pdfService.generate({
      template: 'invoice',
      data: {
        invoiceNumber: \`INV-2026-\${id}\`,
        customerName: 'Acme International Corp',
        amount: 2499.99,
        createdAt: new Date(),
      },
      format: 'A4',
      printBackground: true,
      watermark: {
        text: 'PAID',
        color: '#22c55e',
        opacity: 0.15,
      },
      headerFooter: {
        displayHeaderFooter: true,
        footerTemplate:
          '<div style="font-size: 9px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      },
    });

    // Directly streams PDF with correct Content-Type & disposition
    await pdf.sendToHttp(res, {
      filename: \`invoice-\${id}.pdf\`,
      disposition: 'attachment',
    });
  }
}`}
          />
        </div>
      </div>

      {/* Success banner */}
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span className="font-medium">
          {locale === 'es'
            ? '¡Eso es todo! Tu aplicación NestJS ya puede generar PDFs seguros, de alto rendimiento y con aislamiento total.'
            : 'That is it! Your NestJS application is now producing secure, high-performance PDFs with complete process isolation.'}
        </span>
      </div>
    </div>
  );
}
