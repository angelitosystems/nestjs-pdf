import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { Module, Injectable } from '@nestjs/common';
import { PdfModule, PdfService } from '../../src';

@Injectable()
export class ReportGeneratorService {
  constructor(private readonly pdfService: PdfService) {}

  async generateExecutiveReport() {
    const reportData = {
      title: 'Q3 Enterprise Performance Report',
      subtitle: 'Comprehensive financial, engineering, and operational metrics',
      client: 'Board of Directors & Executive Committee',
      date: new Date(),
      classification: 'Confidential',
      summary:
        'During the third quarter of 2026, Angelito Systems demonstrated continued operational strength, expanding cloud software margins and reducing infrastructure processing latency by 38%. PDF generation workloads across microservices scaled seamlessly with the introduction of our resilient Chromium browser pooling architecture.',
      kpis: [
        { label: 'Total Revenue', value: '$4.2M', growth: 18.5 },
        { label: 'Cloud Gross Margin', value: '78.2%', growth: 4.1 },
        { label: 'Service Uptime', value: '99.99%', growth: 0.05 },
        { label: 'Net Retention Rate', value: '124%', growth: -2.1 },
      ],
      departments: [
        { name: 'Core Engineering & Platform', budget: 850000, actual: 820000, variance: 30000, status: 'On Track' },
        { name: 'Cloud Infrastructure & DevOps', budget: 420000, actual: 410000, variance: 10000, status: 'On Track' },
        { name: 'Product Design & DX', budget: 280000, actual: 295000, variance: -15000, status: 'Attention' },
        { name: 'Security & Compliance Audits', budget: 190000, actual: 185000, variance: 5000, status: 'On Track' },
        { name: 'Developer Relations & Support', budget: 310000, actual: 340000, variance: -30000, status: 'Delayed' },
      ],
    };

    console.log('Generating executive report PDF...');
    const result = await this.pdfService.generate({
      template: 'executive-report',
      data: { report: reportData },
      format: 'A4',
      orientation: 'portrait',
      margins: {
        top: '20mm',
        right: '20mm',
        bottom: '25mm',
        left: '20mm',
      },
      header: {
        html: '<div style="font-size: 8px; color: #94a3b8; width: 100%; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Angelito Systems &bull; Confidential Executive Briefing</div>',
      },
      footer: {
        pageNumbers: true,
      },
      filename: 'executive-report-q3.pdf',
    });

    const outputPath = path.resolve(__dirname, 'executive-report-q3.pdf');
    await result.save(outputPath);
    console.log(`Report generated successfully! Saved to: ${outputPath}`);
  }
}

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: path.resolve(__dirname, 'templates'),
      defaultFormat: 'A4',
      concurrency: 2,
    }),
  ],
  providers: [ReportGeneratorService],
})
export class ReportExampleModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ReportExampleModule);
  const generator = app.get(ReportGeneratorService);
  await generator.generateExecutiveReport();
  await app.close();
}

if (require.main === module) {
  bootstrap().catch(console.error);
}

