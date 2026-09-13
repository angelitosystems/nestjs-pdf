import { Module } from '@nestjs/common';
import { SecurityModule } from '../security/security.module';
import { AssetManagerService } from './asset-manager.service';
import { AssetService } from './asset.service';

@Module({
  imports: [SecurityModule],
  providers: [AssetManagerService, AssetService],
  exports: [AssetService, AssetManagerService],
})
export class AssetModule {}
