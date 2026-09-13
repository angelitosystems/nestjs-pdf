import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { HardDrive, Layers } from 'lucide-react';

export function StorageSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Capa de Almacenamiento' : 'Storage Adapters'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'La capa de almacenamiento sigue el principio de inversión de dependencias. StorageService delega la persistencia en una clase abstracta StorageAdapter intercambiable.'
            : 'The storage subsystem follows dependency inversion principles. StorageService delegates document persistence to a swappable StorageAdapter abstract contract.'}
        </p>
      </div>

      {/* Visual architecture */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
        <div className="text-teal-400 font-bold">// Storage Architecture</div>
        <pre className="text-slate-300 leading-relaxed">
{`PdfResult.save('invoices/2026-001.pdf')
  │
  ▼
[ StorageService ]
  │
  ▼
[ STORAGE_ADAPTER ] (Abstract Class Contract)
  ├── LocalStorageService (Default, saves to disk)
  ├── Custom S3StorageAdapter (AWS S3 / Cloudflare R2)
  └── Custom MinioStorageAdapter (On-premise S3)`}
        </pre>
      </div>

      {/* Abstract class contract */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-500" />
          {locale === 'es' ? 'Contrato: StorageAdapter' : 'Contract: StorageAdapter'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Cualquier adaptador de almacenamiento debe extender la clase abstracta StorageAdapter:'
            : 'Every custom storage adapter simply extends the StorageAdapter abstract class:'}
        </p>
        <CodeBlock
          filename="src/storage/storage.interface.ts"
          code={`export abstract class StorageAdapter {
  abstract save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string>;
  abstract exists(destination: string): Promise<boolean>;
  abstract read(destination: string): Promise<Buffer>;
  abstract delete(destination: string): Promise<void>;
}`}
        />
      </div>

      {/* Default LocalStorageService */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            LocalStorageService
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Es el adaptador predeterminado. Resuelve la ruta relativa o absoluta configurada en storage.basePath, crea los directorios padres si no existen y escribe el archivo de forma atómica.'
            : 'The default out-of-the-box adapter. Resolves disk paths against storage.basePath, automatically creates parent directories recursively, and safely persists the binary.'}
        </p>
      </div>
    </div>
  );
}
