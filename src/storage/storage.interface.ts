import { StorageSaveOptions } from './storage.types';

/**
 * Common contract / abstract base class for storage adapters (Local filesystem, S3, MinIO, Azure Blob, GCS).
 */
export abstract class StorageAdapter {
  /**
   * Saves the provided buffer to the target storage destination.
   */
  abstract save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string>;

  /**
   * Checks whether a file exists at the given destination.
   */
  abstract exists(destination: string): Promise<boolean>;

  /**
   * Reads a file from storage.
   */
  abstract read(destination: string): Promise<Buffer>;

  /**
   * Deletes a file from storage.
   */
  abstract delete(destination: string): Promise<void>;
}
