import { Module } from '@nestjs/common';
import { PdfModule } from '../../../src';
import { InvoiceService } from './invoice/invoice.service';
import { InvoiceController } from './invoice/invoice.controller';

@Module({
  imports: [
    PdfModule.forRoot({
      defaultFormat: 'A4',
      defaultOrientation: 'portrait',
      concurrency: 5,
      queueTimeout: 30000,
      browser: {
        min: 1,
        max: 5,
        maxOperationsPerBrowser: 100,
      },
      cache: {
        enabled: true,
      },
    }),
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class AppModule {}

