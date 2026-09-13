import { Injectable } from '@nestjs/common';
import { PdfResult, PdfService } from '../../../../src';

export interface InvoiceDto {
  number: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
}

@Injectable()
export class InvoiceService {
  constructor(private readonly pdfService: PdfService) {}

  async generateInvoicePdf(dto: InvoiceDto, signal?: AbortSignal): Promise<PdfResult> {
    const subtotal = dto.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const tax = subtotal * 0.19;
    const grandTotal = subtotal + tax;

    return await this.pdfService.generate({
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #f3f4f6; }
            .totals { margin-top: 25px; float: right; width: 300px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>FACTURA DE VENTA #{{number}}</h2>
            <p>Cliente: <strong>{{customerName}}</strong> ({{customerEmail}})</p>
          </div>
          <table>
            <thead>
              <tr><th>Item</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>
            </thead>
            <tbody>
              {{#each items}}
              <tr>
                <td>{{this.name}}</td>
                <td>{{this.quantity}}</td>
                <td>{{currency this.price "USD"}}</td>
                <td>{{currency (formatNumber this.price) "USD"}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: {{currency totals.subtotal "USD"}}</p>
            <p>IVA (19%): {{currency totals.tax "USD"}}</p>
            <h3>Total: {{currency totals.grandTotal "USD"}}</h3>
          </div>
        </body>
        </html>
      `,
      data: {
        number: dto.number,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        items: dto.items,
        totals: { subtotal, tax, grandTotal },
      },
      format: 'A4',
      orientation: 'portrait',
      filename: `invoice-${dto.number}.pdf`,
      footer: {
        pageNumbers: true,
      },
      signal,
    });
  }
}

