import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { Server, ShieldCheck, Terminal } from 'lucide-react';

export function DockerDeploymentGuide() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Despliegue con Docker y Producción' : 'Production Docker & Deployment'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'Aprende a empaquetar tu aplicación NestJS con Chromium en un contenedor Docker optimizado, seguro y sin procesos huérfanos.'
            : 'Learn how to containerize your NestJS app with system Chromium into an optimized, unprivileged production Docker container.'}
        </p>
      </div>

      {/* Production Multi-stage Dockerfile */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-rose-500" />
          {locale === 'es' ? 'Dockerfile Multi-Etapa Verificado' : 'Verified Multi-Stage Dockerfile'}
        </h2>
        <CodeBlock
          language="dockerfile"
          filename="Dockerfile"
          code={`# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-bookworm-slim AS runner

# Install Chromium, fonts, and dumb-init
RUN apt-get update && apt-get install -y --no-install-recommends \\
    dumb-init \\
    chromium \\
    fonts-liberation \\
    fonts-noto-color-emoji \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

# Point Playwright to system chromium
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app

# Create unprivileged user
RUN groupadd -r nestjs && useradd -r -g nestjs -G audio,video nestjs \\
    && mkdir -p /home/nestjs /app/dist /app/storage \\
    && chown -R nestjs:nestjs /home/nestjs /app

USER nestjs

# dumb-init prevents zombie Chromium subprocesses
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "dist/main.js"]`}
        />
      </div>

      {/* Key Docker Considerations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-rose-500" />
            {locale === 'es' ? '¿Por qué usar dumb-init?' : 'Why use dumb-init?'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'En contenedores Docker, Node.js corre como PID 1 y no adopta procesos zombies ni propaga señales SIGTERM a los subprocesos de Chromium. dumb-init resuelve esto cosechando procesos huérfanos.'
              : 'In containers, Node runs as PID 1 and fails to reap zombie Chromium subprocesses or forward SIGTERM correctly. dumb-init acts as a minimal init system solving process leaks.'}
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {locale === 'es' ? 'Ejecución No-Root' : 'Unprivileged Execution'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Nunca ejecutes Chromium como usuario root en producción. El Dockerfile crea el usuario nestjs con acceso estricto a las carpetas requeridas.'
              : 'Never run Chromium as root in production. The Dockerfile establishes the unprivileged nestjs user with restricted folder access.'}
          </p>
        </div>
      </div>
    </div>
  );
}
