import {
  PdfError,
  PdfTemplateNotFoundError,
  PdfRenderingError,
  PdfTimeoutError,
  PdfAbortError,
  PdfEngineError,
  PdfAssetError,
  PdfSecurityError,
  PdfStorageError,
  PdfConfigurationError,
} from '../../src/common/exceptions/pdf.exceptions';

describe('PdfExceptions', () => {
  it('PdfError should inherit from Error with code and details', () => {
    const err = new PdfError('Base error', 'CUSTOM_CODE', { key: 'val' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PdfError');
    expect(err.code).toBe('CUSTOM_CODE');
    expect(err.details).toEqual({ key: 'val' });
  });

  it('PdfTemplateNotFoundError should set searchPaths in details', () => {
    const err = new PdfTemplateNotFoundError('invoice', ['/p1', '/p2']);
    expect(err.code).toBe('TEMPLATE_NOT_FOUND');
    expect(err.details?.templateName).toBe('invoice');
    expect(err.details?.searchPaths).toEqual(['/p1', '/p2']);
  });

  it('PdfRenderingError should store cause', () => {
    const cause = new Error('Syntax error');
    const err = new PdfRenderingError('Failed compiling', cause);
    expect(err.code).toBe('RENDERING_ERROR');
    expect(err.details?.causeMessage).toBe('Syntax error');
  });

  it('PdfTimeoutError should capture timeoutMs', () => {
    const err = new PdfTimeoutError('rendering', 15000);
    expect(err.code).toBe('TIMEOUT_ERROR');
    expect(err.details?.timeoutMs).toBe(15000);
  });

  it('PdfAbortError should have ABORT_ERROR code', () => {
    const err = new PdfAbortError();
    expect(err.code).toBe('ABORT_ERROR');
  });

  it('PdfEngineError should have ENGINE_ERROR code', () => {
    const err = new PdfEngineError('Chromium crashed');
    expect(err.code).toBe('ENGINE_ERROR');
  });

  it('PdfAssetError should capture assetPath', () => {
    const err = new PdfAssetError('Not found', '/path/logo.png');
    expect(err.code).toBe('ASSET_ERROR');
    expect(err.details?.assetPath).toBe('/path/logo.png');
  });

  it('PdfSecurityError should have SECURITY_ERROR code', () => {
    const err = new PdfSecurityError('Path traversal detected');
    expect(err.code).toBe('SECURITY_ERROR');
  });

  it('PdfStorageError should capture destination', () => {
    const err = new PdfStorageError('Write failed', '/dest/file.pdf');
    expect(err.code).toBe('STORAGE_ERROR');
    expect(err.details?.destination).toBe('/dest/file.pdf');
  });

  it('PdfConfigurationError should have CONFIGURATION_ERROR code', () => {
    const err = new PdfConfigurationError('Invalid pool min');
    expect(err.code).toBe('CONFIGURATION_ERROR');
  });
});
