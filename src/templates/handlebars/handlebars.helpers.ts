/**
 * Built-in, safe, typed Handlebars helpers.
 */
export const defaultHandlebarsHelpers: Record<string, (...args: unknown[]) => unknown> = {
  /**
   * Formats a numeric value as a currency string.
   * Usage: {{currency total "USD" "en-US"}} or {{currency total "EUR" "es-ES"}}
   */
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

  /**
   * Formats a date value.
   * Usage: {{date createdAt "es-ES"}}
   */
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

  /**
   * Formats a number with specific decimal digits.
   * Usage: {{formatNumber price 2 "en-US"}}
   */
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

  /**
   * Transforms string to uppercase.
   * Usage: {{uppercase status}}
   */
  uppercase(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).toUpperCase();
  },

  /**
   * Transforms string to lowercase.
   * Usage: {{lowercase code}}
   */
  lowercase(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  },

  /**
   * Strict equality helper.
   * Usage: {{#if (eq status "PAID")}}...{{/if}}
   */
  eq(a: unknown, b: unknown): boolean {
    return a === b;
  },

  /**
   * Inequality helper.
   * Usage: {{#if (ne status "CANCELLED")}}...{{/if}}
   */
  ne(a: unknown, b: unknown): boolean {
    return a !== b;
  },

  /**
   * Greater than helper.
   */
  gt(a: unknown, b: unknown): boolean {
    return Number(a) > Number(b);
  },

  /**
   * Greater than or equal helper.
   */
  gte(a: unknown, b: unknown): boolean {
    return Number(a) >= Number(b);
  },

  /**
   * Less than helper.
   */
  lt(a: unknown, b: unknown): boolean {
    return Number(a) < Number(b);
  },

  /**
   * Less than or equal helper.
   */
  lte(a: unknown, b: unknown): boolean {
    return Number(a) <= Number(b);
  },

  /**
   * Logical AND helper.
   */
  and(...args: unknown[]): boolean {
    // Handlebars passes options hash as the last argument
    const items = args.slice(0, -1);
    return items.every(Boolean);
  },

  /**
   * Logical OR helper.
   */
  or(...args: unknown[]): boolean {
    const items = args.slice(0, -1);
    return items.some(Boolean);
  },

  /**
   * Logical NOT helper.
   */
  not(value: unknown): boolean {
    return !value;
  },
};

