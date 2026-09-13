import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function CustomStorageGuide() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Guía: Adaptador de Storage en S3 / MinIO' : 'Guide: Custom S3 / MinIO Storage Adapter'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Aprende a implementar un adaptador de almacenamiento personalizado para guardar los PDFs generados directamente en buckets de AWS S3 o MinIO.'
            : 'Learn how to implement a custom storage adapter to save generated PDF documents directly into AWS S3 or MinIO buckets.'}
        </p>
      </div>

      {/* Step 1: Install AWS SDK */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '1. Instalar el SDK de AWS S3' : '1. Install AWS S3 SDK'}
        </h2>
        <CodeBlock language="bash" code="npm install @aws-sdk/client-s3" />
      </div>

      {/* Step 2: Implement StorageAdapter */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '2. Implementar la clase StorageAdapter' : '2. Implement StorageAdapter Class'}
        </h2>
        <CodeBlock
          filename="src/storage/s3-storage.adapter.ts"
          code={`import { Injectable } from '@nestjs/common';
import { StorageAdapter, StorageSaveOptions } from '@angelitosystems/nestjs-pdf';
import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter extends StorageAdapter {
  private readonly s3: S3Client;
  private readonly bucketName = process.env.AWS_S3_BUCKET || 'my-company-pdfs';

  constructor() {
    super();
    this.s3 = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: destination,
        Body: buffer,
        ContentType: options?.mimeType || 'application/pdf',
      })
    );
    return \`https://\${this.bucketName}.s3.amazonaws.com/\${destination}\`;
  }

  async exists(destination: string): Promise<boolean> {
    try {
      await this.s3.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: destination }));
      return true;
    } catch {
      return false;
    }
  }

  async read(destination: string): Promise<Buffer> {
    const response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucketName, Key: destination }));
    const stream = response.Body as any;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  async delete(destination: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: destination }));
  }
}`}
        />
      </div>

      {/* Step 3: Register in Module */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '3. Registrar el Adaptador en PdfModule' : '3. Register Adapter in PdfModule'}
        </h2>
        <CodeBlock
          filename="src/app.module.ts"
          code={`import { Module } from '@nestjs/common';
import { PdfModule, STORAGE_ADAPTER } from '@angelitosystems/nestjs-pdf';
import { S3StorageAdapter } from './storage/s3-storage.adapter';

@Module({
  imports: [
    PdfModule.forRoot({
      providers: [
        {
          provide: STORAGE_ADAPTER,
          useClass: S3StorageAdapter,
        },
      ],
    }),
  ],
})
export class AppModule {}`}
        />
      </div>
    </div>
  );
}

