function formatDateFn(value: unknown, formatOrLocale = 'YYYY-MM-DD', locale = 'en-US'): string {
  if (value === null || value === undefined || value === '') return '';
  const dateObj = value instanceof Date ? value : new Date(String(value));
  if (isNaN(dateObj.getTime())) return String(value);

  if (typeof formatOrLocale === 'string' && /[YMDHms]/.test(formatOrLocale)) {
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = dateObj.getFullYear();
    const month = pad(dateObj.getMonth() + 1);
    const day = pad(dateObj.getDate());
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    return formatOrLocale
      .replace(/YYYY/g, String(year))
      .replace(/YY/g, String(year).slice(-2))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds);
  }

  const targetLocale = typeof formatOrLocale === 'string' && formatOrLocale.includes('-') ? formatOrLocale : locale;
  try {
    return new Intl.DateTimeFormat(typeof targetLocale === 'string' ? targetLocale : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(dateObj);
  } catch {
    return dateObj.toISOString().split('T')[0];
  }
}

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

  formatDate(value: unknown, formatOrLocale = 'YYYY-MM-DD', locale = 'en-US'): string {
    return formatDateFn(value, formatOrLocale, locale);
  },

  date(value: unknown, locale = 'en-US'): string {
    return formatDateFn(value, 'YYYY-MM-DD', locale);
  },

  default(value: unknown, defaultValue: unknown): unknown {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    return value;
  },

  json(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
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

