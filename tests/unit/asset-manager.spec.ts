import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { AssetManager } from '../../src/assets/asset-manager';
import { PdfAssetError, PdfSecurityError } from '../../src/pdf/pdf.exceptions';

describe('AssetManager', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-asset-test-'));
  const testFile = path.join(tempDir, 'test-image.png');
  // Simple 1x1 PNG buffer
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

  it('should resolve a raw Buffer directly into a data URI', async () => {
    const manager = new AssetManager({}, tempDir);
    const resolved = await manager.resolveAsset(samplePngBuffer, undefined, 'image/png');

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toContain('data:image/png;base64,');
    expect(resolved.data.equals(samplePngBuffer)).toBe(true);
  });

  it('should resolve a valid Data URI string', async () => {
    const manager = new AssetManager({}, tempDir);
    const dataUri = `data:image/png;base64,${samplePngBuffer.toString('base64')}`;
    const resolved = await manager.resolveAsset(dataUri);

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toBe(dataUri);
    expect(resolved.data.equals(samplePngBuffer)).toBe(true);
  });

  it('should resolve a local file safely to base64 Data URI', async () => {
    const manager = new AssetManager({ allowedAssetPaths: [tempDir] }, tempDir);
    const resolved = await manager.resolveAsset('test-image.png', tempDir);

    expect(resolved.mimeType).toBe('image/png');
    expect(resolved.dataUri).toContain('data:image/png;base64,');
  });

  it('should reject local files outside allowed asset paths', async () => {
    const manager = new AssetManager({ allowedAssetPaths: [path.join(tempDir, 'nonexistent')] }, tempDir);
    // Attempt to access a file in another directory
    const sensitiveFile = path.join(os.tmpdir(), 'arbitrary.txt');
    fs.writeFileSync(sensitiveFile, 'sensitive');

    await expect(manager.resolveAsset(sensitiveFile, tempDir)).rejects.toThrow(PdfSecurityError);

    fs.unlinkSync(sensitiveFile);
  });

  it('should reject assets that exceed maxAssetSizeBytes', async () => {
    const manager = new AssetManager({ maxAssetSizeBytes: 10 }, tempDir);
    await expect(manager.resolveAsset(samplePngBuffer)).rejects.toThrow(PdfAssetError);
  });

  it('should resolve custom font and generate CSS @font-face', async () => {
    const fontFile = path.join(tempDir, 'Roboto.ttf');
    fs.writeFileSync(fontFile, Buffer.from('fake font data'));

    const manager = new AssetManager({ allowedAssetPaths: [tempDir] }, tempDir);
    const css = await manager.resolveFont(
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

