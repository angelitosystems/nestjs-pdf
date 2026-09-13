import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import { StorageAdapter, StorageSaveOptions } from './storage.interface';
import { PdfStorageError } from '../pdf/pdf.exceptions';

/**
 * Local filesystem storage adapter.
 */
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly basePath?: string) {}

  public async save(
    buffer: Buffer,
    destination: string,
    options?: StorageSaveOptions,
  ): Promise<string> {
    try {
      const fullPath = this.resolvePath(destination);
      const dir = path.dirname(fullPath);

      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      if (!options?.overwrite && fs.existsSync(fullPath)) {
        // Safe to overwrite by default if overwrite is undefined or true, but if explicit false throw error
        if (options?.overwrite === false) {
          throw new Error(`File already exists at destination: ${fullPath}`);
        }
      }

      await fs.promises.writeFile(fullPath, buffer);
      return fullPath;
    } catch (err) {
      throw new PdfStorageError(
        `Failed to save file to local filesystem at "${destination}": ${err instanceof Error ? err.message : String(err)}`,
        destination,
        err instanceof Error ? err : undefined,
      );
    }
  }

  public async exists(destination: string): Promise<boolean> {
    const fullPath = this.resolvePath(destination);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  public async read(destination: string): Promise<Buffer> {
    try {
      const fullPath = this.resolvePath(destination);
      return await fs.promises.readFile(fullPath);
    } catch (err) {
      throw new PdfStorageError(
        `Failed to read file from "${destination}": ${err instanceof Error ? err.message : String(err)}`,
        destination,
        err instanceof Error ? err : undefined,
      );
    }
  }

  public async delete(destination: string): Promise<void> {
    try {
      const fullPath = this.resolvePath(destination);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
    } catch (err) {
      throw new PdfStorageError(
        `Failed to delete file from "${destination}": ${err instanceof Error ? err.message : String(err)}`,
        destination,
        err instanceof Error ? err : undefined,
      );
    }
  }

  private resolvePath(destination: string): string {
    if (this.basePath && !path.isAbsolute(destination)) {
      return path.resolve(this.basePath, destination);
    }
    return path.resolve(destination);
  }
}

