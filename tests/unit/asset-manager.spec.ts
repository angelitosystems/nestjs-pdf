import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { AssetManagerService } from '../../src/asset/asset-manager.service';
import { AssetService } from '../../src/asset/asset.service';
import { PdfSecurityService } from '../../src/security/security.service';
import { PdfAssetError, PdfSecurityError } from '../../src/common/exceptions/pdf.exceptions';

describe('AssetModule Services', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-asset-test-'));
  const testFile = path.join(tempDir, 'test-image.png');
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64',
  );

  beforeAll(() => {
    fs.writeFileSync(testFile, samplePngBuffer);
  });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createAssetService = (securityOpts = {}) => {
    const secService = new PdfSecurityService({ security: securityOpts, templatesPath: tempDir });
    const manager = new AssetManagerService(secService, { security: securityOpts, templatesPath: tempDir });
    return new AssetService(manager);
  };

  it('should resolve a raw Buffer directly into a data URI', async () => {
    const service = createAssetService();
    const resolved = await service.resolve(samplePngBuffer, undefined, 'image/png');

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toContain('data:image/png;base64,');
    expect(resolved.data.equals(samplePngBuffer)).toBe(true);
  });

  it('should resolve a valid Data URI string', async () => {
    const service = createAssetService();
    const dataUri = `data:image/png;base64,${samplePngBuffer.toString('base64')}`;
    const resolved = await service.resolve(dataUri);

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toBe(dataUri);
  });

  it('should resolve a local file safely to base64 Data URI', async () => {
    const service = createAssetService({ allowedAssetPaths: [tempDir] });
    const resolved = await service.resolve('test-image.png', tempDir);

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toContain('data:image/png;base64,');
  });

  it('should reject local files outside allowed asset paths', async () => {
    const service = createAssetService({ allowedAssetPaths: [path.join(tempDir, 'nonexistent')] });
    const sensitiveFile = path.join(os.tmpdir(), 'arbitrary.txt');
    fs.writeFileSync(sensitiveFile, 'sensitive');

    await expect(service.resolve(sensitiveFile, tempDir)).rejects.toThrow(PdfSecurityError);

    fs.unlinkSync(sensitiveFile);
  });

  it('should reject assets that exceed maxAssetSizeBytes', async () => {
    const service = createAssetService({ maxAssetSizeBytes: 10 });
    await expect(service.resolve(samplePngBuffer)).rejects.toThrow(PdfAssetError);
  });

  it('should resolve custom font and generate CSS @font-face', async () => {
    const fontFile = path.join(tempDir, 'Roboto.ttf');
    fs.writeFileSync(fontFile, Buffer.from('fake font data'));

    const service = createAssetService({ allowedAssetPaths: [tempDir] });
    const css = await service.resolveFont(
      {
        family: 'Roboto',
        path: fontFile,
        weight: 700,
        style: 'italic',
      },
      tempDir,
    );

    expect(css).toContain("@font-face");
    expect(css).toContain("font-family: 'Roboto'");
    expect(css).toContain("font-weight: 700");
    expect(css).toContain("font-style: italic");
    expect(css).toContain("src: url('data:font/ttf;base64,");
  });
});
