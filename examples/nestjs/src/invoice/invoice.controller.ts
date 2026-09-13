import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  private getSampleDto(id: string) {
    return {
      number: id,
      customerName: 'Acme Corporation',
      customerEmail: 'billing@acme.corp',
      items: [
        { name: 'Cloud Infrastructure Setup', quantity: 1, price: 1500 },
        { name: 'NestJS Microservices Architecture', quantity: 2, price: 800 },
      ],
    };
  }

  /**
   * 1. Direct HTTP Download (Content-Disposition: attachment)
   */
  @Get(':id/download')
  async downloadInvoice(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.invoiceService.generateInvoicePdf(this.getSampleDto(id));
    await result.send(res, { disposition: 'attachment', filename: `factura-${id}.pdf` });
  }

  /**
   * 2. Browser Inline Preview (Content-Disposition: inline)
   */
  @Get(':id/view')
  async viewInvoice(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.invoiceService.generateInvoicePdf(this.getSampleDto(id));
    await result.send(res, { disposition: 'inline' });
  }

  /**
   * 3. Buffer Output
   */
  @Get(':id/buffer')
  async getInvoiceBuffer(@Param('id') id: string) {
    const result = await this.invoiceService.generateInvoicePdf(this.getSampleDto(id));
    return {
      filename: result.filename,
      size: result.size,
      mimeType: result.mimeType,
      base64: result.buffer.toString('base64'),
    };
  }

  /**
   * 4. Save to Disk
   */
  @Get(':id/save')
  async saveInvoice(@Param('id') id: string) {
    const result = await this.invoiceService.generateInvoicePdf(this.getSampleDto(id));
    const savedPath = await result.save(`./storage/invoices/invoice-${id}.pdf`);
    return {
      message: 'Invoice PDF saved successfully',
      path: savedPath,
      size: result.size,
    };
  }
}

