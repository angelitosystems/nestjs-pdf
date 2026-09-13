import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { Module, Injectable } from '@nestjs/common';
import { PdfModule, PdfService } from '../../src';

@Injectable()
export class InvoiceGeneratorService {
  constructor(private readonly pdfService: PdfService) {}

  async generateDemoInvoice() {
    const invoiceData = {
      invoiceNumber: 'INV-2026-0042',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'paid',
      company: {
        name: 'Angelito Systems S.A.S.',
        taxId: '901.452.889-1',
        address: 'Calle 100 # 8A-45, Bogotá, Colombia',
        email: 'billing@angelitosystems.com',
        phone: '+57 (1) 745-8900',
      },
      customer: {
        name: 'Corporación Tecnológica Global Ltda.',
        taxId: '800.123.456-7',
        address: 'Av. El Dorado # 68C-61, Oficina 502',
        email: 'finance@globaltech.com',
      },
      payment: {
        method: 'Transferencia Bancaria (ACH)',
        bank: 'Bancolombia',
        accountNumber: '****-****-****-5521',
      },
      items: [
        {
          name: 'Licencia Enterprise @angelitosystems/nestjs-pdf',
          description: 'Suscripción anual para entornos de producción con soporte prioritario 24/7',
          quantity: 1,
          unitPrice: 1200.0,
          taxRate: 19,
          total: 1200.0,
        },
        {
          name: 'Consultoría e Integración Cloud',
          description: 'Configuración de Playwright Browser Pool en Kubernetes / AWS Fargate',
          quantity: 16,
          unitPrice: 150.0,
          taxRate: 19,
          total: 2400.0,
        },
        {
          name: 'Capacitación Arquitectura de Microservicios NestJS',
          description: 'Taller práctico intensivo para equipo de ingeniería (8 horas)',
          quantity: 1,
          unitPrice: 800.0,
          taxRate: 19,
          total: 800.0,
        },
      ],
      totals: {
        subtotal: 4400.0,
        discounts: 200.0,
        tax: 798.0,
        grandTotal: 4998.0,
      },
      notes:
        'Gracias por hacer negocios con Angelito Systems. Esta factura es un documento tributario electrónico válido. Por favor conserve este comprobante.',
    };

    console.log('Generating invoice PDF...');
    const result = await this.pdfService.generate({
      template: 'invoice',
      data: invoiceData,
      format: 'A4',
      orientation: 'portrait',
      margins: {
        top: '15mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
      footer: {
        pageNumbers: true,
      },
      watermark: {
        text: 'PAGADO',
        opacity: 0.1,
        rotate: -35,
      },
      metadata: {
        title: `Factura ${invoiceData.invoiceNumber}`,
        author: 'Angelito Systems',
        subject: 'Comprobante Fiscal Electrónico',
        keywords: ['factura', 'pdf', 'angelito-systems'],
      },
      filename: `factura-${invoiceData.invoiceNumber}.pdf`,
    });

    const outputPath = path.resolve(__dirname, `factura-${invoiceData.invoiceNumber}.pdf`);
    await result.save(outputPath);
    console.log(`Invoice PDF generated successfully! Saved to: ${outputPath}`);
    console.log(`Size: ${result.size} bytes`);
  }
}

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: path.resolve(__dirname, 'templates'),
      defaultFormat: 'A4',
      concurrency: 3,
    }),
  ],
  providers: [InvoiceGeneratorService],
})
export class InvoiceExampleModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(InvoiceExampleModule);
  const generator = app.get(InvoiceGeneratorService);
  await generator.generateDemoInvoice();
  await app.close();
}

if (require.main === module) {
  bootstrap().catch(console.error);
}

