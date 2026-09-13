import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { LocalStorageAdapter } from '../../src/storage/local.storage';

describe('LocalStorageAdapter', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-storage-test-'));
  const adapter = new LocalStorageAdapter(tempDir);

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should save buffer to destination file creating parent directories', async () => {
    const content = Buffer.from('PDF file payload');
    const relativePath = 'nested/invoices/inv-001.pdf';

    const savedPath = await adapter.save(content, relativePath);

    expect(fs.existsSync(savedPath)).toBe(true);
    expect(fs.readFileSync(savedPath).toString()).toBe('PDF file payload');
  });

  it('should check if file exists', async () => {
    const exists = await adapter.exists('nested/invoices/inv-001.pdf');
    const notExists = await adapter.exists('nested/invoices/does-not-exist.pdf');

    expect(exists).toBe(true);
    expect(notExists).toBe(false);
  });

  it('should read file from storage', async () => {
    const data = await adapter.read('nested/invoices/inv-001.pdf');
    expect(data.toString()).toBe('PDF file payload');
  });

  it('should delete file from storage', async () => {
    await adapter.delete('nested/invoices/inv-001.pdf');
    const existsAfter = await adapter.exists('nested/invoices/inv-001.pdf');
    expect(existsAfter).toBe(false);
  });
});

