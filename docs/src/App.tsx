import { useState } from 'react';
import {
  FileText,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Terminal,
  BookOpen,
  Server,
  Code,
  Sparkles,
  Lock,
} from 'lucide-react';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

function CodeSnippet({ code, language = 'typescript' }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-xs text-slate-400">
        <span className="font-mono text-rose-400 font-semibold">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'installation' | 'quickstart' | 'async' | 'adapters' | 'security' | 'docker' | 'api'>('overview');

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'installation', label: 'Installation', icon: Terminal },
    { id: 'quickstart', label: 'Quick Start', icon: Zap },
    { id: 'async', label: 'forRootAsync', icon: Sparkles },
    { id: 'adapters', label: 'Custom Adapters', icon: Cpu },
    { id: 'security', label: 'Security & SSRF', icon: ShieldCheck },
    { id: 'docker', label: 'Docker & CI/CD', icon: Server },
    { id: 'api', label: 'API Reference', icon: Code },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center shadow-lg shadow-rose-600/30">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                @angelitosystems/<span className="text-rose-500">nestjs-pdf</span>
                <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-medium">v0.1.0</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.npmjs.com/package/@angelitosystems/nestjs-pdf"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              NPM Registry
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/AngelitoSystems/nestjs-pdf"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
            >
              GitHub Repository
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Documentation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}

          <div className="pt-6 border-t border-slate-800/80 mt-6 px-3 space-y-3">
            <div className="text-xs text-slate-500 font-mono">Architecture Spec</div>
            <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Playwright Core:</span>
                <span className="text-slate-200 font-mono">^1.50</span>
              </div>
              <div className="flex justify-between">
                <span>NestJS Support:</span>
                <span className="text-slate-200 font-mono">v10 / v11</span>
              </div>
              <div className="flex justify-between">
                <span>Vulnerabilities:</span>
                <span className="text-emerald-400 font-semibold font-mono">0 (Pass)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Built natively for NestJS
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  Enterprise PDF Generation for NestJS
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-400 leading-relaxed">
                  A high-performance, decoupled NestJS module designed for production microservices. Features strict isolated browser contexts, automated recycling, SSRF protection, in-memory concurrency queue, and dynamic templating.
                </p>
              </div>

              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">True NestJS Modules</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Composed of 9 decoupled submodules, abstract adapter classes, and Symbol injection tokens for maximum testability.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">Isolated Contexts</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Browser instances are pooled, while requests receive isolated BrowserContexts and Pages, recycled on schedule.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-white">SSRF & Traversal Guard</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Blocks private RFC 1918 subnets, cloud metadata (169.254.169.254), integer IP evasions, and canonical directory escapes.
                  </p>
                </div>
              </div>

              {/* Getting started snippet */}
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-rose-400" />
                  One-Line Installation
                </h3>
                <CodeSnippet code="npm install @angelitosystems/nestjs-pdf playwright-core" language="bash" />
                <p className="text-xs text-slate-400">
                  Chromium is kept lean via <code className="text-rose-300">playwright-core</code>. Install the browser binary explicitly or reference system packages in Docker:
                </p>
                <CodeSnippet code="npx playwright install chromium" language="bash" />
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">NestJS Modular Architecture</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Strictly adheres to NestJS principles: separate modules, single responsibility services, and decoupled abstraction boundaries.
                </p>
              </div>

              {/* Visual Diagram */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 font-mono text-xs overflow-x-auto">
                <div className="text-rose-400 font-bold mb-4">// Dependency Graph</div>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-white">PdfModule</span>
                    <span className="text-slate-400">Root Orchestrator (forRoot / forRootAsync)</span>
                  </div>
                  <div className="pl-6 border-l-2 border-slate-800 space-y-2">
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-rose-400">PdfService</span>
                      <span className="text-slate-400">Clean facade exposing generate(), sendToHttp()</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-blue-400">PdfRendererModule</span>
                      <span className="text-slate-400">Orchestrates assets, templates, watermark, and engine</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-amber-400">PdfQueueModule</span>
                      <span className="text-slate-400">In-memory FIFO queue with concurrency limits & AbortSignal</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-emerald-400">PdfStorageModule</span>
                      <span className="text-slate-400">StorageService delegating to StorageAdapter (LocalStorage / S3)</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-purple-400">PdfEngineModule</span>
                      <span className="text-slate-400">PlaywrightPdfEngine providing PDF_ENGINE token</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-cyan-400">PdfBrowserModule</span>
                      <span className="text-slate-400">BrowserPoolService with isolated Context/Page lifecycle</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/70 rounded-md border border-slate-800/80 flex items-center justify-between">
                      <span className="text-indigo-400">PdfSecurityModule</span>
                      <span className="text-slate-400">SSRF IP resolution & path traversal validation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Injection Tokens Table */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-3">Injection Token</th>
                      <th className="p-3">Base Interface / Class</th>
                      <th className="p-3">Default Implementation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    <tr>
                      <td className="p-3 text-rose-400 font-bold">PDF_MODULE_OPTIONS</td>
                      <td className="p-3 text-slate-300">PdfModuleOptions</td>
                      <td className="p-3 text-slate-400">Injected Configuration</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-purple-400 font-bold">PDF_ENGINE</td>
                      <td className="p-3 text-slate-300">PdfEngine (abstract)</td>
                      <td className="p-3 text-slate-400">PlaywrightPdfEngine</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-cyan-400 font-bold">TEMPLATE_ENGINE</td>
                      <td className="p-3 text-slate-300">TemplateEngine (abstract)</td>
                      <td className="p-3 text-slate-400">HandlebarsTemplateEngine</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">STORAGE_ADAPTER</td>
                      <td className="p-3 text-slate-300">StorageAdapter (abstract)</td>
                      <td className="p-3 text-slate-400">LocalStorageService</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INSTALLATION */}
          {activeTab === 'installation' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Installation & Setup</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Step-by-step setup for development and production environments.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-bold">1</span>
                  Install Package
                </h3>
                <CodeSnippet code="npm install @angelitosystems/nestjs-pdf playwright-core" language="bash" />
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-bold">2</span>
                  Download Chromium Engine
                </h3>
                <p className="text-xs text-slate-400">
                  We purposefully do not bundle browser binaries inside npm packages to maintain minimal package footprint and prevent build lockups.
                </p>
                <CodeSnippet code="npx playwright install chromium" language="bash" />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Linux / CI / Docker Tip:</strong> If running in Ubuntu or Alpine containers, you can install the OS package <code className="text-amber-200">chromium</code> directly and specify <code className="text-amber-200">executablePath: '/usr/bin/chromium'</code>, avoiding the need for npx playwright download in containers.
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICKSTART */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Quick Start</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Register the dynamic module in your AppModule and inject PdfService into any controller or service.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">1. Register PdfModule.forRoot()</h3>
                <CodeSnippet
                  code={`import { Module } from '@nestjs/common';
import { PdfModule } from '@angelitosystems/nestjs-pdf';

@Module({
  imports: [
    PdfModule.forRoot({
      templatesPath: './templates',
      browser: {
        min: 1,
        max: 3,
        maxOperationsPerBrowser: 50, // Auto-recycles browser after 50 renders
      },
      concurrency: {
        limit: 5,
        queueTimeout: 20000,
      },
    }),
  ],
})
export class AppModule {}`}
                  language="typescript"
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">2. Generate & Stream PDF</h3>
                <CodeSnippet
                  code={`import { Controller, Get, Res } from '@nestjs/common';
import { PdfService } from '@angelitosystems/nestjs-pdf';
import type { Response } from 'express';

@Controller('reports')
export class ReportController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('monthly')
  async downloadReport(@Res() res: Response) {
    const result = await this.pdfService.generate({
      template: 'monthly-report',
      data: {
        company: 'Angelito Systems',
        revenue: 85200.0,
        items: [{ desc: 'Cloud Infrastructure', cost: 1200 }],
      },
      format: 'A4',
      printBackground: true,
      watermark: {
        text: 'CONFIDENTIAL',
        opacity: 0.1,
        color: '#dc2626',
      },
      headerFooter: {
        displayHeaderFooter: true,
        footerTemplate: '<div style="font-size: 10px; width: 100%; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      },
    });

    // Stream directly to Express / Fastify response
    await result.sendToHttp(res, {
      filename: 'monthly-report-2026.pdf',
      disposition: 'inline',
    });
  }
}`}
                  language="typescript"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ASYNC */}
          {activeTab === 'async' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Asynchronous Configuration (forRootAsync)</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Load configuration at runtime using NestJS ConfigService, database settings, or custom factories.
                </p>
              </div>

              <CodeSnippet
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
        templatesPath: config.get<string>('PDF_TEMPLATES_PATH', './templates'),
        browser: {
          min: config.get<number>('PDF_BROWSER_MIN', 1),
          max: config.get<number>('PDF_BROWSER_MAX', 4),
          launchOptions: {
            executablePath: config.get<string>('CHROMIUM_PATH'),
          },
        },
        concurrency: {
          limit: config.get<number>('PDF_CONCURRENCY', 10),
        },
        security: {
          allowExternalResources: false,
          maxAssetSizeBytes: 15 * 1024 * 1024, // 15MB
        },
      }),
    }),
  ],
})
export class AppModule {}`}
                language="typescript"
              />
            </div>
          )}

          {/* TAB 6: CUSTOM ADAPTERS */}
          {activeTab === 'adapters' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Custom Adapters & DI Overrides</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Every layer is fully swappable. Implement abstract classes and bind them to their corresponding injection tokens.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Custom S3 / MinIO Storage Adapter</h3>
                <CodeSnippet
                  code={`import { Injectable } from '@nestjs/common';
import { StorageAdapter, STORAGE_ADAPTER, StorageSaveOptions } from '@angelitosystems/nestjs-pdf';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter extends StorageAdapter {
  private readonly s3 = new S3Client({ region: 'us-east-1' });

  async save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string> {
    const bucket = 'enterprise-pdf-bucket';
    await this.s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: destination,
      Body: buffer,
      ContentType: options?.mimeType || 'application/pdf',
    }));
    return \`https://\${bucket}.s3.amazonaws.com/\${destination}\`;
  }

  async exists(destination: string): Promise<boolean> {
    // S3 HeadObject check
    return true;
  }

  async read(destination: string): Promise<Buffer> {
    // S3 GetObject implementation
    return Buffer.from('');
  }

  async delete(destination: string): Promise<void> {
    // S3 DeleteObject implementation
  }
}

// Register inside PdfModule:
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
                  language="typescript"
                />
              </div>
            </div>
          )}

          {/* TAB 7: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Security & SSRF Hardening</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Built to withstand hostile multi-tenant environments where user-provided HTML, CSS, or templates are processed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 className="font-semibold text-rose-400 flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4" /> SSRF Defense Layer
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
                    <li>Resolves DNS ahead-of-time before requesting remote assets.</li>
                    <li>Blocks private subnets: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.</li>
                    <li>Blocks cloud metadata endpoints (169.254.169.254).</li>
                    <li>Detects DWORD/hex integer IP address evasion attempts.</li>
                    <li>Restricts outbound domains to an explicit whitelist.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h4 className="font-semibold text-blue-400 flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4" /> Path Traversal Prevention
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs text-slate-400 list-disc list-inside">
                    <li>Rejects relative escapes (<code className="text-slate-300">../../etc/passwd</code>).</li>
                    <li>Filters URL encoded traversal sequences (<code className="text-slate-300">%2e%2e%2f</code>).</li>
                    <li>Strips null byte injections (<code className="text-slate-300">%00</code>).</li>
                    <li>Resolves canonical filesystem paths via <code className="text-slate-300">fs.realpathSync</code> to block symlink escapes.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: DOCKER */}
          {activeTab === 'docker' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">Production Docker Deployment</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Complete multi-stage Dockerfile with Chromium, dumb-init, and unprivileged user execution.
                </p>
              </div>

              <CodeSnippet
                code={`# Multi-stage production Dockerfile for NestJS + Chromium
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runner
# Install OS dependencies and system chromium
RUN apt-get update && apt-get install -y --no-install-recommends \\
    dumb-init \\
    chromium \\
    fonts-liberation \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV NODE_ENV=production

WORKDIR /app
RUN groupadd -r nestjs && useradd -r -g nestjs nestjs \\
    && mkdir -p /app/dist /app/storage \\
    && chown -R nestjs:nestjs /app

USER nestjs
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/main.js"]`}
                language="dockerfile"
              />
            </div>
          )}

          {/* TAB 9: API */}
          {activeTab === 'api' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-white">API Reference</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Core methods and options available in PdfService and PdfResult.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-mono text-sm text-rose-400 font-semibold">
                    pdfService.generate(options: GeneratePdfOptions): Promise&lt;PdfResult&gt;
                  </div>
                  <p className="text-xs text-slate-400">
                    Renders an HTML string or template file, applies watermarks, injects header/footers, and returns a rich PdfResult instance.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-mono text-sm text-blue-400 font-semibold">
                    pdfResult.toBuffer(): Buffer
                  </div>
                  <p className="text-xs text-slate-400">
                    Returns the raw binary Buffer of the generated PDF document.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-mono text-sm text-cyan-400 font-semibold">
                    pdfResult.toStream(): Readable
                  </div>
                  <p className="text-xs text-slate-400">
                    Returns a Node.js Readable stream of the document for memory-efficient piping.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-mono text-sm text-emerald-400 font-semibold">
                    pdfResult.save(destination: string): Promise&lt;string&gt;
                  </div>
                  <p className="text-xs text-slate-400">
                    Persists the document through the configured StorageAdapter (local disk, AWS S3, etc.).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="font-mono text-sm text-purple-400 font-semibold">
                    pdfResult.sendToHttp(res: HttpResponseLike, options?: SendHttpOptions): Promise&lt;void&gt;
                  </div>
                  <p className="text-xs text-slate-400">
                    Streams the PDF over HTTP with correct Content-Type, Content-Length, and Content-Disposition headers (compatible with Express and Fastify).
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Released under the <a href="https://opensource.org/licenses/MIT" className="text-slate-400 hover:underline">MIT License</a>.
          </div>
          <div>
            Built with ❤️ by <span className="text-slate-300 font-semibold">AngelitoSystems</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

