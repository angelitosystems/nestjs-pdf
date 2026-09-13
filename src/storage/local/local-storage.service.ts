import * as fs from 'fs';
import * as path from 'path';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { StorageAdapter } from '../storage.interface';
import { StorageSaveOptions } from '../storage.types';
import { PDF_MODULE_OPTIONS } from '../../common/constants/tokens.constants';
import type { PdfModuleOptions } from '../../common/types/pdf.types';
import { PdfStorageError } from '../../common/exceptions/pdf.exceptions';

@Injectable()
export class LocalStorageService implements StorageAdapter {
  private readonly basePath?: string;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    moduleOptions?: PdfModuleOptions,
  ) {
    this.basePath = moduleOptions?.storage?.basePath;
  }

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

      if (options?.overwrite === false && fs.existsSync(fullPath)) {
        throw new Error(`File already exists at destination: ${fullPath}`);
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

