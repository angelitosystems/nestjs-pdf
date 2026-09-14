import { Module } from '@nestjs/common';
import { BrowserDetector } from './browser-detector';
import { BrowserLauncher } from './browser-launcher';
import { BrowserManagerService } from './browser-manager.service';
import { BrowserPoolService } from './browser-pool.service';
import { BrowserService } from './browser.service';

@Module({
  providers: [
    BrowserDetector,
    BrowserLauncher,
    BrowserManagerService,
    BrowserPoolService,
    BrowserService,
  ],
  exports: [
    BrowserDetector,
    BrowserLauncher,
    BrowserService,
    BrowserPoolService,
    BrowserManagerService,
  ],
})
export class BrowserModule {}

