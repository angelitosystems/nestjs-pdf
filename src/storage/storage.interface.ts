import { StorageSaveOptions } from './storage.types';

/**
 * Common contract for storage adapters (Local filesystem, S3, MinIO, Azure Blob, GCS).
 */
export interface StorageAdapter {
  /**
   * Saves the provided buffer to the target storage destination.
   */
  save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string>;

  /**
   * Checks whether a file exists at the given destination.
   */
  exists(destination: string): Promise<boolean>;

  /**
   * Reads a file from storage.
   */
  read(destination: string): Promise<Buffer>;

  /**
   * Deletes a file from storage.
   */
  delete(destination: string): Promise<void>;
}
