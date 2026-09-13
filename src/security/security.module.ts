import { Module } from '@nestjs/common';
import { PdfSecurityService } from './security.service';

@Module({
  providers: [PdfSecurityService],
  exports: [PdfSecurityService],
})
export class SecurityModule {}
