import { NestFactory } from '@nestjs/core';
import { Module, Injectable } from '@nestjs/common';
import { PdfModule, PdfService } from '../../src';

@Injectable()
class BasicPdfService {
  constructor(private readonly pdfService: PdfService) {}

  async run() {
    console.log('Generating basic PDF...');
    const result = await this.pdfService.generate({
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #2563eb;">{{title}}</h1>
          <p style="font-size: 16px; color: #4b5563;">{{message}}</p>
          <div style="margin-top: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
            <p><strong>Generated At:</strong> {{date now}}</p>
            <p><strong>Amount:</strong> {{currency amount "USD"}}</p>
          </div>
        </div>
      `,
      data: {
        title: 'Hello from Angelito Systems PDF!',
        message: 'A clean, modern and production-ready PDF generator for NestJS.',
        amount: 249.99,
        now: new Date(),
      },
      format: 'A4',
      orientation: 'portrait',
      filename: 'basic-example.pdf',
    });

    const savedPath = await result.save('./basic-example.pdf');
    console.log(`Basic PDF saved successfully to: ${savedPath}`);
  }
}

@Module({
  imports: [
    PdfModule.forRoot({
      defaultFormat: 'A4',
      concurrency: 2,
    }),
  ],
  providers: [BasicPdfService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const basicService = app.get(BasicPdfService);
  await basicService.run();
  await app.close();
}

if (require.main === module) {
  bootstrap().catch(console.error);
}

