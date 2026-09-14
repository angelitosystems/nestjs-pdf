import { Readable } from 'stream';
import { PdfResultImpl } from '../../src/pdf/pdf.result';
import { StorageService } from '../../src/storage/storage.service';
import { StorageAdapter } from '../../src/storage/storage.interface';
import { HttpResponseLike } from '../../src/common/types/pdf.types';

describe('PdfResult', () => {
  const dummyBuffer = Buffer.from('%PDF-1.4 dummy content');
  const mockAdapter: StorageAdapter = {
    save: jest.fn().mockResolvedValue('/resolved/path.pdf'),
    exists: jest.fn().mockResolvedValue(true),
    read: jest.fn().mockResolvedValue(dummyBuffer),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  const mockStorageService = new StorageService(mockAdapter);

  it('should expose buffer, size, filename, and mimeType', () => {
    const result = new PdfResultImpl(dummyBuffer, 'report.pdf', { title: 'Test Report' }, mockStorageService);

    expect(result.buffer).toBe(dummyBuffer);
    expect(result.size).toBe(dummyBuffer.length);
    expect(result.filename).toBe('report.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.metadata?.title).toBe('Test Report');
  });

  it('should return a readable stream from stream()', async () => {
    const result = new PdfResultImpl(dummyBuffer, 'report.pdf');
    const stream = result.stream();

    expect(stream).toBeInstanceOf(Readable);

    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const combined = Buffer.concat(chunks);
    expect(combined.equals(dummyBuffer)).toBe(true);
  });

  it('should delegate save() to StorageService and StorageAdapter', async () => {
    const result = new PdfResultImpl(dummyBuffer, 'invoice.pdf', undefined, mockStorageService);
    const savedPath = await result.save('/target/invoice.pdf');

    expect(mockAdapter.save).toHaveBeenCalledWith(dummyBuffer, '/target/invoice.pdf', {
      contentType: 'application/pdf',
      overwrite: true,
    });
    expect(savedPath).toBe('/resolved/path.pdf');
  });

  it('should send PDF through Express response object', async () => {
    const result = new PdfResultImpl(dummyBuffer, 'invoice.pdf');
    const setHeaderMock = jest.fn();
    const sendMock = jest.fn();
    const statusMock = jest.fn().mockReturnThis();

    const mockExpressRes: HttpResponseLike = {
      setHeader: setHeaderMock,
      status: statusMock,
      send: sendMock,
    };

    await result.send(mockExpressRes, { disposition: 'attachment', filename: 'custom-inv.pdf' });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(setHeaderMock).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(setHeaderMock).toHaveBeenCalledWith('Content-Length', dummyBuffer.length);
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('attachment; filename="custom-inv.pdf"'),
    );
    expect(sendMock).toHaveBeenCalledWith(dummyBuffer);
  });

  it('should send PDF through Fastify response object', async () => {
    const result = new PdfResultImpl(dummyBuffer, 'invoice.pdf');
    const headerMock = jest.fn();
    const sendMock = jest.fn();
    const codeMock = jest.fn().mockReturnThis();

    const mockFastifyReply: HttpResponseLike = {
      header: headerMock,
      code: codeMock,
      send: sendMock,
    };

    await result.send(mockFastifyReply, { disposition: 'inline' });

    expect(codeMock).toHaveBeenCalledWith(200);
    expect(headerMock).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    expect(headerMock).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('inline; filename="invoice.pdf"'),
    );
    expect(sendMock).toHaveBeenCalledWith(dummyBuffer);
  });

  it('should support toBuffer(), toStream(), and sendToHttp() convenience methods', async () => {
    const result = new PdfResultImpl(dummyBuffer, 'invoice.pdf');
    expect(result.toBuffer().equals(dummyBuffer)).toBe(true);
    expect(result.toStream()).toBeInstanceOf(Readable);

    const sendMock = jest.fn();
    const setHeaderMock = jest.fn();
    const statusMock = jest.fn().mockReturnThis();
    const mockRes: HttpResponseLike = {
      setHeader: setHeaderMock,
      status: statusMock,
      send: sendMock,
    };

    await result.sendToHttp(mockRes, { filename: 'report-streamed.pdf' });
    expect(sendMock).toHaveBeenCalledWith(dummyBuffer);
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('filename="report-streamed.pdf"'),
    );
  });
});
