import { Inject, Injectable } from '@nestjs/common';
import { PDF_ENGINE } from '../common/constants/tokens.constants';
import { PdfEngine } from './pdf-engine.interface';
import { EngineRenderOptions } from './engine.types';

@Injectable()
export class PdfEngineService {
  constructor(
    @Inject(PDF_ENGINE)
    private readonly engine: PdfEngine,
  ) {}

  public async render(options: EngineRenderOptions): Promise<Buffer> {
    return await this.engine.render(options);
  }

  public getEngine(): PdfEngine {
    return this.engine;
  }
}

