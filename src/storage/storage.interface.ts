/**
 * Options for saving files through a StorageAdapter.
 */
export interface StorageSaveOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  overwrite?: boolean;
}

/**
 * Common contract for storage adapters (Local filesystem, S3, MinIO, Azure Blob, GCS).
 */
export interface StorageAdapter {
  /**
   * Saves the provided buffer to the target storage destination.
   * @param buffer Content to save
   * @param destination Destination path or key
   * @param options Additional save options
   * @returns Resolved absolute destination path or URI
   */
  save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string>;

  /**
   * Checks whether a file exists at the given destination path or key.
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

