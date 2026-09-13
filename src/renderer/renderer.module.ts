import { Module } from '@nestjs/common';
import { TemplateModule } from '../template/template.module';
import { AssetModule } from '../asset/asset.module';
import { SecurityModule } from '../security/security.module';
import { EngineModule } from '../engine/engine.module';
import { PdfRendererService } from './renderer.service';

@Module({
  imports: [TemplateModule, AssetModule, SecurityModule, EngineModule],
  providers: [PdfRendererService],
  exports: [PdfRendererService],
})
export class RendererModule {}

