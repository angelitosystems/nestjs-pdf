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

  public toResponse(): { success: false; error: { code: string; message: string; details?: Record<string, unknown> } } {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

/**
 * Base class for browser-related errors.
 */
export class PdfBrowserError extends PdfError {
  constructor(message: string, code = 'PDF_BROWSER_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
  }
}

/**
 * Thrown when no compatible Chromium browser is found on the system.
 */
export class PdfBrowserNotFoundError extends PdfBrowserError {
  constructor(
    message = 'No compatible Chromium-based browser was found.',
    details?: Record<string, unknown>,
  ) {
    super(message, 'PDF_BROWSER_NOT_FOUND', {
      suggestion: 'Install Chrome, Chromium or Edge, or configure browser.executablePath.',
      ...details,
    });
  }
}

/**
 * Thrown when the browser process fails to launch.
 */
export class PdfBrowserLaunchFailedError extends PdfBrowserError {
  constructor(message: string, cause?: Error, details?: Record<string, unknown>) {
    const isDebug =
      typeof process !== 'undefined' &&
      (process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development');

    super(`Failed to launch browser: ${message}`, 'PDF_BROWSER_LAUNCH_FAILED', {
      suggestion: 'Verify that the browser executable has required execution permissions and dependencies.',
      ...(isDebug && cause ? { causeMessage: cause.message, stack: cause.stack } : {}),
      ...details,
    });
  }
}

/**
 * Thrown when an explicit executablePath is missing or invalid.
 */
export class PdfBrowserExecutableInvalidError extends PdfBrowserError {
  constructor(executablePath: string, reason?: string) {
    super(
      `Invalid browser executable path: "${executablePath}"${reason ? ` (${reason})` : ''}`,
      'PDF_BROWSER_EXECUTABLE_INVALID',
      {
        executablePath,
        suggestion: 'Verify that the executable path points to a valid Chromium-based binary file.',
      },
    );
  }
}

/**
 * Thrown when remote connection via CDP/WebSocket fails.
 */
export class PdfBrowserConnectionFailedError extends PdfBrowserError {
  constructor(endpoint: string, cause?: Error) {
    super(
      `Failed to connect to remote browser at "${endpoint}"`,
      'PDF_BROWSER_CONNECTION_FAILED',
      {
        endpoint,
        suggestion: 'Ensure the remote Chrome/Chromium instance is running with remote debugging enabled.',
        ...(cause ? { causeMessage: cause.message } : {}),
      },
    );
  }
}

/**
 * Thrown when rendering the page or producing PDF fails.
 */
export class PdfRenderFailedError extends PdfError {
  constructor(message: string, cause?: Error, details?: Record<string, unknown>) {
    super(`PDF rendering failed: ${message}`, 'PDF_RENDER_FAILED', {
      ...details,
      ...(cause ? { causeMessage: cause.message } : {}),
    });
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
 * Thrown when the browser engine fails or encounters a fatal crash.
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


