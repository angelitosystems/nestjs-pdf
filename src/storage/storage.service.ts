import { Inject, Injectable } from '@nestjs/common';
import { STORAGE_ADAPTER } from '../common/constants/tokens.constants';
import { StorageAdapter } from './storage.interface';
import { StorageSaveOptions } from './storage.types';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_ADAPTER)
    private readonly adapter: StorageAdapter,
  ) {}

  public async save(buffer: Buffer, destination: string, options?: StorageSaveOptions): Promise<string> {
    return await this.adapter.save(buffer, destination, options);
  }

  public async exists(destination: string): Promise<boolean> {
    return await this.adapter.exists(destination);
  }

  public async read(destination: string): Promise<Buffer> {
    return await this.adapter.read(destination);
  }

  public async delete(destination: string): Promise<void> {
    return await this.adapter.delete(destination);
  }

  public getAdapter(): StorageAdapter {
    return this.adapter;
  }
}

