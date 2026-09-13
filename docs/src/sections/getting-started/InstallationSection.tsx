import { Terminal } from '../../components/Terminal';
import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export function InstallationSection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Instalación' : 'Installation'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Aprende a instalar @angelitosystems/nestjs-pdf y configurar el motor Chromium en entornos locales, CI y Docker.'
            : 'Learn how to install @angelitosystems/nestjs-pdf and configure the Chromium engine in local, CI, and Docker environments.'}
        </p>
      </div>

      {/* Interactive terminal */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '1. Instalar el paquete y Playwright Core' : '1. Install Package and Playwright Core'}
        </h2>
        <Terminal />
      </div>

      {/* Why playwright-core */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="leading-relaxed">
          <strong>
            {locale === 'es'
              ? '¿Por qué playwright-core y no playwright completo?'
              : 'Why playwright-core and not full playwright?'}
          </strong>
          <p className="mt-1">
            {locale === 'es'
              ? 'El paquete principal usa playwright-core deliberadamente. Esto evita que npm install descargue 500MB de navegadores pesados que arruinarían tus pipelines de despliegue o imágenes Docker de producción.'
              : 'The core package intentionally uses playwright-core. This prevents npm install from downloading 500MB of browser binaries that would bloat your CI/CD pipelines and production Docker images.'}
          </p>
        </div>
      </div>

      {/* Peer Dependencies */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '2. Dependencias de Ecosistema (Peer Dependencies)' : '2. Peer Dependencies'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'El paquete está optimizado para funcionar con versiones modernas de NestJS (v9, v10 y v11):'
            : 'The package is verified to run seamlessly across modern NestJS releases (v9, v10, and v11):'}
        </p>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Peer Package</th>
                <th className="p-3">Supported Version</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              <tr>
                <td className="p-3 text-slate-900 dark:text-white font-bold">@nestjs/common</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">^9.0.0 || ^10.0.0 || ^11.0.0</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-900 dark:text-white font-bold">@nestjs/core</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">^9.0.0 || ^10.0.0 || ^11.0.0</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-900 dark:text-white font-bold">reflect-metadata</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">^0.1.13 || ^0.2.0</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
                </td>
              </tr>
              <tr>
                <td className="p-3 text-slate-900 dark:text-white font-bold">rxjs</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">^7.0.0 || ^8.0.0</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compatible
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chromium in Docker */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? '3. Configuración en Linux y Docker' : '3. Linux & Docker Setup'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'En contenedores Docker (ej. Debian/Ubuntu slim), puedes instalar chromium mediante apt y configurar la variable de entorno:'
            : 'In Docker containers (e.g. Debian/Ubuntu slim), you can install system chromium via apt and export the executable path:'}
        </p>
        <CodeBlock
          language="dockerfile"
          filename="Dockerfile snippet"
          code={`# Install system Chromium and dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \\
    dumb-init \\
    chromium \\
    fonts-liberation \\
    && rm -rf /var/lib/apt/lists/*

# Tell Playwright to use system binary without downloading
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`}
        />
      </div>
    </div>
  );
}

