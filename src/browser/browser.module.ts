import { Module } from '@nestjs/common';
import { BrowserManagerService } from './browser-manager.service';
import { BrowserPoolService } from './browser-pool.service';
import { BrowserService } from './browser.service';

@Module({
  providers: [BrowserManagerService, BrowserPoolService, BrowserService],
  exports: [BrowserService, BrowserPoolService, BrowserManagerService],
})
export class BrowserModule {}
