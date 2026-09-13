import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function PdfModuleSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          PdfModule
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'PdfModule es el módulo dinámico raíz que orquesta los 9 submódulos y registra todos los providers y tokens DI en el contenedor de NestJS.'
            : 'PdfModule is the root dynamic module that orchestrates the 9 submodules and registers all providers and DI tokens inside the NestJS container.'}
        </p>
      </div>

      {/* Synchronous vs Asynchronous */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '1. Registro Síncrono: forRoot()' : '1. Synchronous Registration: forRoot()'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Úsalo cuando las opciones sean estáticas o conocidas al momento de compilar el módulo:'
            : 'Use this when options are static or already available at compile time:'}
        </p>
        <CodeBlock
          filename="src/app.module.ts"
          code={`import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      browser: { min: 1, max: 3 },
    }),
  ],
})
export class AppModule {}`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '2. Registro Asíncrono: forRootAsync()' : '2. Asynchronous Registration: forRootAsync()'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Permite inyectar proveedores como ConfigService o cargar valores desde variables de entorno y base de datos:'
            : 'Allows injecting providers such as ConfigService or pulling configuration from database or vault at runtime:'}
        </p>
        <CodeBlock
          filename="src/app.module.ts"
          code={`import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PdfModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        templatesPath: config.get<string>('PDF_TEMPLATES', './templates'),
        browser: {
          min: config.get<number>('PDF_BROWSER_MIN', 1),
          max: config.get<number>('PDF_BROWSER_MAX', 4),
        },
        concurrency: {
          limit: config.get<number>('PDF_CONCURRENCY', 8),
        },
      }),
    }),
  ],
})
export class AppModule {}`}
        />
      </div>

      {/* Providers Override */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '3. Reemplazo de Proveedores (Custom Providers)' : '3. Custom Providers Override'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Puedes pasar proveedores personalizados en la propiedad providers para sobreescribir STORAGE_ADAPTER, PDF_ENGINE o TEMPLATE_ENGINE:'
            : 'You can pass custom providers directly in the providers array to override STORAGE_ADAPTER, PDF_ENGINE, or TEMPLATE_ENGINE:'}
        </p>
        <CodeBlock
          filename="src/app.module.ts"
          code={`import { Module } from '@nestjs/common';
import { PdfModule, STORAGE_ADAPTER } from '@angelitosystems/nestjs-pdf';
import { S3StorageService } from './s3-storage.service';

@Module({
  imports: [
    PdfModule.forRoot({
      providers: [
        {
          provide: STORAGE_ADAPTER,
          useClass: S3StorageService,
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

