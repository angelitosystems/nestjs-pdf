/**
 * Base error class for all PDF generation related errors.
 */
export class PdfError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'PDF_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when a specified template or related asset cannot be found.
 */
export class PdfTemplateNotFoundError extends PdfError {
  constructor(templateName: string, searchPaths: string[]) {
    super(
      `Template "${templateName}" was not found in paths: ${searchPaths.join(', ')}`,
      'TEMPLATE_NOT_FOUND',
      { templateName, searchPaths },
    );
  }
}

/**
 * Thrown when rendering the template into HTML or compiling styles fails.
 */
export class PdfRenderingError extends PdfError {
  constructor(message: string, cause?: Error, details?: Record<string, unknown>) {
    super(`PDF Rendering failed: ${message}`, 'RENDERING_ERROR', {
      ...details,
      causeMessage: cause?.message,
      stack: cause?.stack,
    });
  }
}

/**
 * Thrown when an operation exceeds its configured timeout.
 */
export class PdfTimeoutError extends PdfError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation "${operation}" timed out after ${timeoutMs}ms`,
      'TIMEOUT_ERROR',
      { operation, timeoutMs },
    );
  }
}

/**
 * Thrown when an operation is cancelled via an AbortSignal.
 */
export class PdfAbortError extends PdfError {
  constructor(message = 'PDF generation was cancelled via AbortSignal') {
    super(message, 'ABORT_ERROR');
  }
}

/**
 * Thrown when the browser engine (Playwright) fails or encounters a fatal crash.
 */
export class PdfEngineError extends PdfError {
  constructor(message: string, cause?: Error) {
    super(`PDF Engine failure: ${message}`, 'ENGINE_ERROR', {
      causeMessage: cause?.message,
      stack: cause?.stack,
    });
  }
}

/**
 * Thrown when an asset fails to resolve, exceeds size limits, or violates security policies.
 */
export class PdfAssetError extends PdfError {
  constructor(message: string, assetPath?: string) {
    super(`Asset resolution error: ${message}`, 'ASSET_ERROR', { assetPath });
  }
}

/**
 * Thrown when an asset or URL violates SSRF or path traversal security rules.
 */
export class PdfSecurityError extends PdfError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Security policy violation: ${message}`, 'SECURITY_ERROR', details);
  }
}

/**
 * Thrown when a storage operation (saving, reading) fails.
 */
export class PdfStorageError extends PdfError {
  constructor(message: string, destination?: string, cause?: Error) {
    super(`Storage error: ${message}`, 'STORAGE_ERROR', {
      destination,
      causeMessage: cause?.message,
    });
  }
}

/**
 * Thrown when invalid configuration is provided to the module or generation options.
 */
export class PdfConfigurationError extends PdfError {
  constructor(message: string) {
    super(`Configuration error: ${message}`, 'CONFIGURATION_ERROR');
  }
}
