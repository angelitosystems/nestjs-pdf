import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { Injectable } from '@nestjs/common';
import { PdfSecurityOptions, PdfFont } from '../pdf/pdf.types';
import { PdfAssetError, PdfSecurityError } from '../pdf/pdf.exceptions';
import { SecurityUtils } from '../utils/security.utils';

export interface ResolvedAsset {
  data: Buffer;
  mimeType: string;
  dataUri: string;
}

/**
 * Manages loading, validating, securing, and transforming assets (images, fonts, stylesheets)
 * into safe base64 Data URIs to eliminate filesystem permission and cross-origin issues in headless browsers.
 */
@Injectable()
export class AssetManager {
  private readonly defaultMaxSizeBytes = 10 * 1024 * 1024; // 10 MB

  constructor(
    private readonly securityOptions: PdfSecurityOptions = {},
    private readonly defaultTemplatePath: string = './templates',
  ) {}

  /**
   * Resolves an asset from a file path, URL, data URI, or Buffer into a base64 Data URI and raw buffer.
   */
  public async resolveAsset(
    source: string | Buffer,
    contextDir?: string,
    mimeTypeOverride?: string,
  ): Promise<ResolvedAsset> {
    const maxSizeBytes = this.securityOptions.maxAssetSizeBytes ?? this.defaultMaxSizeBytes;

    // 1. Direct Buffer
    if (Buffer.isBuffer(source)) {
      if (source.length > maxSizeBytes) {
        throw new PdfAssetError(`Asset buffer size (${source.length} bytes) exceeds limit of ${maxSizeBytes} bytes`);
      }
      const mimeType = mimeTypeOverride || 'application/octet-stream';
      const dataUri = `data:${mimeType};base64,${source.toString('base64')}`;
      return { data: source, mimeType, dataUri };
    }

    if (typeof source !== 'string' || !source.trim()) {
      throw new PdfAssetError('Asset source must be a non-empty string or Buffer');
    }

    const trimmed = source.trim();

    // 2. Data URI
    if (trimmed.startsWith('data:')) {
      const match = trimmed.match(/^data:([^;]+);base64,(.*)$/);
      if (!match) {
        throw new PdfAssetError('Invalid Data URI format. Only base64 data URIs are supported');
      }
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      if (buffer.length > maxSizeBytes) {
        throw new PdfAssetError(`Data URI asset size (${buffer.length} bytes) exceeds limit of ${maxSizeBytes} bytes`);
      }
      return { data: buffer, mimeType, dataUri: trimmed };
    }

    // 3. HTTP / HTTPS URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return await this.fetchRemoteAsset(trimmed, maxSizeBytes, mimeTypeOverride);
    }

    // 4. Local filesystem path
    return await this.loadLocalAsset(trimmed, contextDir, maxSizeBytes, mimeTypeOverride);
  }

  /**
   * Shorthand to resolve directly to a data URI string.
   */
  public async resolveToDataUri(
    source: string | Buffer,
    contextDir?: string,
    mimeTypeOverride?: string,
  ): Promise<string> {
    const resolved = await this.resolveAsset(source, contextDir, mimeTypeOverride);
    return resolved.dataUri;
  }

  /**
   * Resolves a font configuration into an inlined CSS @font-face declaration.
   */
  public async resolveFont(font: PdfFont, contextDir?: string): Promise<string> {
    const resolved = await this.resolveAsset(font.path, contextDir);
    const format = font.format || this.detectFontFormat(font.path);
    const weight = font.weight ?? 'normal';
    const style = font.style ?? 'normal';

    return `
@font-face {
  font-family: '${font.family}';
  src: url('${resolved.dataUri}') format('${format}');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}
`;
  }

  private async fetchRemoteAsset(
    url: string,
    maxSizeBytes: number,
    mimeTypeOverride?: string,
  ): Promise<ResolvedAsset> {
    await SecurityUtils.validateUrl(url, {
      allowedDomains: this.securityOptions.allowedDomains,
      allowExternalResources: this.securityOptions.allowExternalResources,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'error', // Do not follow redirects automatically to prevent redirect-based SSRF bypass
      });

      if (!response.ok) {
        throw new PdfAssetError(`Failed to fetch remote asset from "${url}": HTTP ${response.status} ${response.statusText}`);
      }

      const contentLengthHeader = response.headers.get('content-length');
      if (contentLengthHeader) {
        const declaredSize = parseInt(contentLengthHeader, 10);
        if (declaredSize > maxSizeBytes) {
          throw new PdfAssetError(`Remote asset from "${url}" exceeds size limit: ${declaredSize} > ${maxSizeBytes} bytes`);
        }
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length > maxSizeBytes) {
        throw new PdfAssetError(`Remote asset size (${buffer.length} bytes) exceeds limit of ${maxSizeBytes} bytes`);
      }

      const detectedMime =
        mimeTypeOverride ||
        response.headers.get('content-type')?.split(';')[0].trim() ||
        mime.lookup(url) ||
        'application/octet-stream';

      const dataUri = `data:${detectedMime};base64,${buffer.toString('base64')}`;
      return { data: buffer, mimeType: detectedMime, dataUri };
    } catch (err) {
      if (err instanceof PdfSecurityError || err instanceof PdfAssetError) {
        throw err;
      }
      throw new PdfAssetError(
        `Failed to fetch asset from "${url}": ${err instanceof Error ? err.message : String(err)}`,
        url,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private async loadLocalAsset(
    filePath: string,
    contextDir: string | undefined,
    maxSizeBytes: number,
    mimeTypeOverride?: string,
  ): Promise<ResolvedAsset> {
    const allowedDirectories = [
      ...(this.securityOptions.allowedAssetPaths || []),
      path.resolve(this.defaultTemplatePath),
    ];

    if (contextDir) {
      allowedDirectories.push(path.resolve(contextDir));
    }

    // If path is relative and contextDir is given, resolve relative to contextDir
    let candidatePath = filePath;
    if (!path.isAbsolute(filePath) && contextDir) {
      candidatePath = path.resolve(contextDir, filePath);
    } else {
      candidatePath = path.resolve(filePath);
    }

    // Enforce path traversal protection and realpath check
    const safePath = SecurityUtils.validatePathTraversal(candidatePath, allowedDirectories);

    if (!fs.existsSync(safePath)) {
      throw new PdfAssetError(`Local asset not found at "${safePath}"`, filePath);
    }

    const stats = await fs.promises.stat(safePath);
    if (!stats.isFile()) {
      throw new PdfAssetError(`Target path is not a file: "${safePath}"`, filePath);
    }

    if (stats.size > maxSizeBytes) {
      throw new PdfAssetError(
        `Local asset size (${stats.size} bytes) exceeds limit of ${maxSizeBytes} bytes: "${safePath}"`,
        filePath,
      );
    }

    const buffer = await fs.promises.readFile(safePath);
    const detectedMime = mimeTypeOverride || mime.lookup(safePath) || 'application/octet-stream';
    const dataUri = `data:${detectedMime};base64,${buffer.toString('base64')}`;

    return { data: buffer, mimeType: detectedMime, dataUri };
  }

  private detectFontFormat(fontPath: string): string {
    const ext = path.extname(fontPath).toLowerCase();
    switch (ext) {
      case '.ttf':
        return 'truetype';
      case '.otf':
        return 'opentype';
      case '.woff':
        return 'woff';
      case '.woff2':
        return 'woff2';
      default:
        return 'truetype';
    }
  }
}

