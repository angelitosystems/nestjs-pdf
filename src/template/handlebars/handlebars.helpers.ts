/**
 * Built-in, safe, typed Handlebars helpers.
 */
export const defaultHandlebarsHelpers: Record<string, (...args: unknown[]) => unknown> = {
  currency(value: unknown, currencyCode = 'USD', locale = 'en-US'): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
    if (isNaN(num)) return String(value ?? '');
    try {
      return new Intl.NumberFormat(typeof locale === 'string' ? locale : 'en-US', {
        style: 'currency',
        currency: typeof currencyCode === 'string' ? currencyCode : 'USD',
      }).format(num);
    } catch {
      return num.toFixed(2);
    }
  },

  date(value: unknown, locale = 'en-US'): string {
    if (!value) return '';
    const dateObj = value instanceof Date ? value : new Date(String(value));
    if (isNaN(dateObj.getTime())) return String(value);
    try {
      return new Intl.DateTimeFormat(typeof locale === 'string' ? locale : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(dateObj);
    } catch {
      return dateObj.toISOString().split('T')[0];
    }
  },

  formatNumber(value: unknown, decimals = 2, locale = 'en-US'): string {
    const num = typeof value === 'number' ? value : parseFloat(String(value ?? 0));
    if (isNaN(num)) return String(value ?? '');
    const dec = typeof decimals === 'number' ? decimals : parseInt(String(decimals), 10) || 0;
    try {
      return new Intl.NumberFormat(typeof locale === 'string' ? locale : 'en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(num);
    } catch {
      return num.toFixed(dec);
    }
  },

  uppercase(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).toUpperCase();
  },

  lowercase(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  },

  eq(a: unknown, b: unknown): boolean {
    return a === b;
  },

  ne(a: unknown, b: unknown): boolean {
    return a !== b;
  },

  gt(a: unknown, b: unknown): boolean {
    return Number(a) > Number(b);
  },

  gte(a: unknown, b: unknown): boolean {
    return Number(a) >= Number(b);
  },

  lt(a: unknown, b: unknown): boolean {
    return Number(a) < Number(b);
  },

  lte(a: unknown, b: unknown): boolean {
    return Number(a) <= Number(b);
  },

  and(...args: unknown[]): boolean {
    const items = args.slice(0, -1);
    return items.every(Boolean);
  },

  or(...args: unknown[]): boolean {
    const items = args.slice(0, -1);
    return items.some(Boolean);
  },

  not(value: unknown): boolean {
    return !value;
  },
};
