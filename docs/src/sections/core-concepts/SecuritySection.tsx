import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';
import { ShieldCheck, Lock, AlertOctagon } from 'lucide-react';

export function SecuritySection() {
  const { locale } = useI18n();

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Seguridad y Defensa contra SSRF' : 'Security & SSRF Hardening'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'En entornos multi-inquilino donde se procesa HTML o datos provistos por usuarios, la generación de PDFs suele ser un vector crítico de ataques SSRF y lectura arbitraria de archivos.'
            : 'In multi-tenant environments where user-supplied HTML or template data is rendered, PDF generation is frequently targeted by SSRF and local file inclusion (LFI) attacks.'}
        </p>
      </div>

      {/* Visual Security Flow Diagram */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto space-y-4">
        <div className="text-rose-400 font-bold">// Security Validation Gateway</div>
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full sm:w-auto">
            <span className="text-rose-400 font-bold">Untrusted URL / Asset</span>
            <div className="text-[10px] text-slate-500 mt-1">Image, font, or stylesheet</div>
          </div>
          <span className="text-slate-500 font-sans">➔</span>
          <div className="p-3 rounded-lg bg-slate-950 border border-rose-500/30 text-center w-full sm:w-auto">
            <span className="text-cyan-400 font-bold">PdfSecurityService</span>
            <div className="text-[10px] text-slate-400 mt-1">DNS pre-resolution & canonical check</div>
          </div>
          <span className="text-slate-500 font-sans">➔</span>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center w-full sm:w-auto">
            <span className="text-emerald-400 font-bold">Allowed / Blocked</span>
            <div className="text-[10px] text-slate-500 mt-1">Throws PdfSecurityError if invalid</div>
          </div>
        </div>
      </div>

      {/* 2 Security Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: SSRF */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {locale === 'es' ? 'Mitigación de SSRF' : 'SSRF Mitigation'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Cuando se activa allowExternalResources, el servicio resuelve el hostname contra DNS antes de permitir cualquier conexión HTTP/HTTPS.'
              : 'When allowExternalResources is enabled, the service resolves the hostname against DNS before allowing any HTTP/HTTPS connection.'}
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
            <li>
              <strong>RFC 1918 & RFC 4193:</strong> Bloquea <code className="text-rose-500">10.0.0.0/8</code>, <code className="text-rose-500">172.16.0.0/12</code>, <code className="text-rose-500">192.168.0.0/16</code> y ULA IPv6.
            </li>
            <li>
              <strong>Cloud Metadata:</strong> Bloquea permanentemente <code className="text-rose-500">169.254.169.254</code> (AWS, GCP, Azure, DigitalOcean).
            </li>
            <li>
              <strong>Loopback & Broadcast:</strong> Bloquea <code className="text-rose-500">127.0.0.0/8</code>, <code className="text-rose-500">0.0.0.0</code> y <code className="text-rose-500">::1</code>.
            </li>
            <li>
              <strong>Evasiones Enteras/Hex:</strong> Detecta notaciones decimales (DWORD), octales y hexadecimales diseñadas para evadir filtros simples.
            </li>
          </ul>
        </div>

        {/* Pillar 2: Path Traversal */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {locale === 'es' ? 'Defensa contra Path Traversal' : 'Path Traversal Defense'}
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'es'
              ? 'Tanto las rutas de plantillas como de activos locales son verificadas contra sus directorios canónicos permitidos.'
              : 'Template files and local static assets are verified against strictly permitted canonical base directories.'}
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
            <li>
              <strong>Resolución canónica realpath:</strong> Previene ataques basados en enlaces simbólicos (symlinks) que apunten a <code className="text-blue-400">/etc/passwd</code> o variables del sistema.
            </li>
            <li>
              <strong>Inyección de bytes nulos:</strong> Rechaza inmediatamente rutas con secuencias nulas (<code className="text-blue-400">%00</code>).
            </li>
            <li>
              <strong>Escapes relativos:</strong> Filtra secuencias <code className="text-blue-400">../</code> y sus variantes codificadas en URL (<code className="text-blue-400">%2e%2e%2f</code>).
            </li>
          </ul>
        </div>
      </div>

      {/* Configuration snippet */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Configuración de Seguridad en PdfModule' : 'Configuring Security Options'}
        </h3>
        <CodeBlock
          filename="src/app.module.ts"
          code={`PdfModule.forRoot({
  security: {
    // Keep false in production unless external assets are required
    allowExternalResources: false,

    // If external resources are allowed, enforce strict domain whitelist
    allowedDomains: ['assets.mycompany.com', 'images.unsplash.com'],

    // Limit where local images and fonts can be read from
    allowedAssetPaths: ['./assets', './templates'],

    // Reject assets exceeding 10MB to prevent memory exhaustion
    maxAssetSizeBytes: 10 * 1024 * 1024,
  },
})`}
        />
      </div>
    </div>
  );
}
