import { Injectable } from '@nestjs/common';
import { AssetManagerService } from './asset-manager.service';
import { ResolvedAsset } from './asset.types';
import { PdfFont } from '../common/types/pdf.types';

@Injectable()
export class AssetService {
  constructor(private readonly manager: AssetManagerService) {}

  public async resolve(
    source: string | Buffer,
    contextDir?: string,
    mimeTypeOverride?: string,
  ): Promise<ResolvedAsset> {
    return await this.manager.resolveAsset(source, contextDir, mimeTypeOverride);
  }

  public async toDataUri(
    source: string | Buffer,
    contextDir?: string,
    mimeTypeOverride?: string,
  ): Promise<string> {
    return await this.manager.resolveToDataUri(source, contextDir, mimeTypeOverride);
  }

  public async resolveFont(font: PdfFont, contextDir?: string): Promise<string> {
    return await this.manager.resolveFont(font, contextDir);
  }
}

