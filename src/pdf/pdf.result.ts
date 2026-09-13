import { Readable } from 'stream';
import { HttpResponseLike, PdfMetadata, PdfResult, SendHttpOptions } from '../common/types/pdf.types';
import { StorageService } from '../storage/storage.service';
import { bufferToStream } from '../common/utils/stream.utils';
import { PDF_MIME_TYPE } from '../common/constants/tokens.constants';

export class PdfResultImpl implements PdfResult {
  public readonly size: number;
  public readonly mimeType: string = PDF_MIME_TYPE;

  constructor(
    public readonly buffer: Buffer,
    public readonly filename: string,
    public readonly metadata?: PdfMetadata,
    private readonly storageService?: StorageService,
  ) {
    this.size = buffer.length;
  }

  public stream(): Readable {
    return bufferToStream(this.buffer);
  }

  public async save(destinationPath: string): Promise<string> {
    if (!this.storageService) {
      throw new Error('No storage service is available on this PdfResult');
    }
    return await this.storageService.save(this.buffer, destinationPath, {
      contentType: this.mimeType,
      overwrite: true,
    });
  }

  public async send(response: HttpResponseLike, options?: SendHttpOptions): Promise<void> {
    const disposition = options?.disposition ?? 'inline';
    const targetFilename = options?.filename ?? this.filename;
    const encodedFilename = encodeURIComponent(targetFilename).replace(/['()]/g, escape);
    const contentDisposition = `${disposition}; filename="${targetFilename}"; filename*=UTF-8''${encodedFilename}`;

    const headers: Record<string, string | number> = {
      'Content-Type': this.mimeType,
      'Content-Length': this.buffer.length,
      'Content-Disposition': contentDisposition,
      'Accept-Ranges': 'bytes',
    };

    for (const [key, value] of Object.entries(headers)) {
      if (typeof response.setHeader === 'function') {
        response.setHeader(key, value);
      } else if (typeof response.header === 'function') {
        response.header(key, value);
      } else if (response.raw && typeof response.raw.setHeader === 'function') {
        response.raw.setHeader(key, value);
      }
    }

    if (typeof response.status === 'function') {
      response.status(200);
    } else if (typeof response.code === 'function') {
      response.code(200);
    }

    if (typeof response.send === 'function') {
      response.send(this.buffer);
    } else if (typeof response.end === 'function') {
      response.end(this.buffer);
    } else if (response.raw && typeof response.raw.end === 'function') {
      response.raw.end(this.buffer);
    }
  }
}
