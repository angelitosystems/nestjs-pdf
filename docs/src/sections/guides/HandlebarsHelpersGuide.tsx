import { CodeBlock } from '../../components/CodeBlock';
import { useI18n } from '../../hooks/useI18n';

export function HandlebarsHelpersGuide() {
  const { locale } = useI18n();

  const helpers = [
    {
      name: 'currency',
      usage: '{{currency amount "USD" "en-US"}}',
      example: '$1,450.50',
      descEn: 'Formats a numeric value into a localized currency string using Intl.NumberFormat.',
      descEs: 'Formatea un valor numérico a moneda localizada usando Intl.NumberFormat.',
    },
    {
      name: 'formatDate',
      usage: '{{formatDate date "YYYY-MM-DD"}}',
      example: '2026-09-13',
      descEn: 'Formats JavaScript Date objects or ISO strings into localized date formats.',
      descEs: 'Formatea objetos Date o cadenas ISO a formatos de fecha localizados.',
    },
    {
      name: 'uppercase',
      usage: '{{uppercase status}}',
      example: 'COMPLETED',
      descEn: 'Converts string to uppercase.',
      descEs: 'Convierte un texto a mayúsculas.',
    },
    {
      name: 'lowercase',
      usage: '{{lowercase email}}',
      example: 'user@example.com',
      descEn: 'Converts string to lowercase.',
      descEs: 'Convierte un texto a minúsculas.',
    },
    {
      name: 'default',
      usage: '{{default note "N/A"}}',
      example: 'N/A',
      descEn: 'Returns fallback value if first parameter is null, undefined, or empty.',
      descEs: 'Retorna un valor por defecto si el primer parámetro es nulo o vacío.',
    },
    {
      name: 'json',
      usage: '{{{json complexObject}}}',
      example: '{"id": 1, "name": "Item"}',
      descEn: 'Serializes object to JSON string (use triple braces to prevent HTML escaping).',
      descEs: 'Serializa un objeto a JSON (usa tres llaves para evitar escape HTML).',
    },
    {
      name: 'eq / ne',
      usage: '{{#if (eq role "ADMIN")}}...{{/if}}',
      example: 'Conditional block',
      descEn: 'Strict equality (===) and inequality (!==) comparison.',
      descEs: 'Comparación estricta de igualdad (===) y desigualdad (!==).',
    },
    {
      name: 'gt / gte / lt / lte',
      usage: '{{#if (gte total 100)}}...{{/if}}',
      example: 'Numerical check',
      descEn: 'Numeric comparisons (greater than, less than, or equal).',
      descEs: 'Comparaciones numéricas (mayor que, menor que, o igual).',
    },
    {
      name: 'and / or',
      usage: '{{#if (and isPaid (not isRefunded))}}...{{/if}}',
      example: 'Logical operator',
      descEn: 'Logical conjunction and disjunction operators.',
      descEs: 'Operadores lógicos de conjunción y disyunción.',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {locale === 'es' ? 'Helpers de Handlebars Integrados' : 'Built-in Handlebars Helpers'}
        </h1>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {locale === 'es'
            ? 'HandlebarsTemplateEngine incluye helpers pre-registrados para formatear números, fechas, comparaciones y estructuras de datos sin configuración adicional.'
            : 'HandlebarsTemplateEngine registers formatting, date, currency, and conditional logic helpers ready to use in your templates.'}
        </p>
      </div>

      {/* Helpers Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3">Helper</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Output Example</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
            {helpers.map((h) => (
              <tr key={h.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-3 text-rose-600 dark:text-rose-400 font-bold">{h.name}</td>
                <td className="p-3 text-slate-700 dark:text-slate-300 font-semibold">{h.usage}</td>
                <td className="p-3 text-emerald-600 dark:text-emerald-400 font-sans">{h.example}</td>
                <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                  {locale === 'es' ? h.descEs : h.descEn}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Custom Helper */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === 'es' ? 'Cómo registrar Helpers Personalizados' : 'Registering Custom Helpers'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {locale === 'es'
            ? 'Puedes registrar helpers adicionales inyectando TemplateService:'
            : 'You can register additional custom helpers by injecting TemplateService:'}
        </p>
        <CodeBlock
          filename="src/custom-helpers.service.ts"
          code={`import { Injectable, OnModuleInit } from '@nestjs/common';
import { TemplateService } from '@angelitosystems/nestjs-pdf';

@Injectable()
export class CustomHelpersService implements OnModuleInit {
  constructor(private readonly templateService: TemplateService) {}

  onModuleInit() {
    // Register custom helper
    this.templateService.registerHelper('barcode', (code: string) => {
      return \`<div class="barcode">\${code}</div>\`;
    });
  }
}`}
        />
      </div>
    </div>
  );
}
