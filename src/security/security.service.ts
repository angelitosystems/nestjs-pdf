import { Inject, Injectable, Optional } from '@nestjs/common';
import * as path from 'path';
import { PDF_MODULE_OPTIONS } from '../common/constants/tokens.constants';
import { PdfModuleOptions, PdfSecurityOptions } from '../common/types/pdf.types';
import { SecurityUtils } from './security.utils';

@Injectable()
export class PdfSecurityService {
  private readonly securityConfig: PdfSecurityOptions;
  private readonly defaultTemplatesPath: string;

  constructor(
    @Optional()
    @Inject(PDF_MODULE_OPTIONS)
    moduleOptions?: PdfModuleOptions,
  ) {
    this.securityConfig = moduleOptions?.security || {};
    this.defaultTemplatesPath = moduleOptions?.templatesPath || './templates';
  }

  /**
   * Validates that a file path resides strictly within allowed directories.
   */
  public validatePath(targetPath: string, extraAllowedDirs?: string[]): string {
    const allowedDirectories = [
      ...(this.securityConfig.allowedAssetPaths || []),
      path.resolve(this.defaultTemplatesPath),
      ...(extraAllowedDirs || []),
    ];

    return SecurityUtils.validatePathTraversal(targetPath, allowedDirectories);
  }

  /**
   * Validates a URL against SSRF, checking whitelist and resolved IP addresses.
   */
  public async validateUrl(urlString: string): Promise<URL> {
    return await SecurityUtils.validateUrl(urlString, {
      allowedDomains: this.securityConfig.allowedDomains,
      allowExternalResources: this.securityConfig.allowExternalResources,
    });
  }

  /**
   * Checks if an IP is private/reserved.
   */
  public isPrivateIp(ip: string): boolean {
    return SecurityUtils.isPrivateOrReservedIp(ip);
  }
}
