import { Module } from '@nestjs/common';
import { STORAGE_ADAPTER } from '../common/constants/tokens.constants';
import { LocalStorageService } from './local/local-storage.service';
import { StorageService } from './storage.service';

@Module({
  providers: [
    LocalStorageService,
    {
      provide: STORAGE_ADAPTER,
      useExisting: LocalStorageService,
    },
    StorageService,
  ],
  exports: [StorageService, STORAGE_ADAPTER, LocalStorageService],
})
export class StorageModule {}

