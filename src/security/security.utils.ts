import * as path from 'path';
import * as fs from 'fs';
import * as dns from 'dns';
import * as net from 'net';
import { PdfSecurityError } from '../common/exceptions/pdf.exceptions';

/**
 * Security utilities for SSRF prevention, IP sanitization, and path traversal defense.
 */
export class SecurityUtils {
  /**
   * Validates that a target file path is safely contained within at least one of the allowed directories.
   * Protects against ../, ..\, encoded traversal (%2e%2e), and symlink escalation.
   */
  public static validatePathTraversal(
    targetPath: string,
    allowedDirectories: string[],
  ): string {
    if (!targetPath || typeof targetPath !== 'string') {
      throw new PdfSecurityError('Path must be a non-empty string');
    }

    // Decode URL-encoded or hex characters (%2e%2e%2f, etc.) repeatedly until stable
    let decodedPath = targetPath;
    let previous = '';
    while (decodedPath !== previous) {
      previous = decodedPath;
      try {
        decodedPath = decodeURIComponent(decodedPath);
      } catch {
        throw new PdfSecurityError(`Malformed path encoding: "${targetPath}"`);
      }
    }

    // Check for null bytes
    if (decodedPath.includes('\0')) {
      throw new PdfSecurityError('Null byte detected in path');
    }

    // Normalize target absolute path
    const normalizedTarget = path.resolve(decodedPath);

    // Resolve real paths if the file exists (checking symlinks)
    let realTargetPath = normalizedTarget;
    if (fs.existsSync(normalizedTarget)) {
      try {
        realTargetPath = fs.realpathSync(normalizedTarget);
      } catch (err) {
        throw new PdfSecurityError(`Failed to resolve real path for "${targetPath}"`, {
          originalError: err instanceof Error ? err.message : String(err),
        });
      }
    }

    // Normalize all allowed directories and their real paths
    const resolvedAllowedDirs = allowedDirectories.map((dir) => {
      const resolved = path.resolve(dir);
      if (fs.existsSync(resolved)) {
        try {
          return fs.realpathSync(resolved);
        } catch {
          return resolved;
        }
      }
      return resolved;
    });

    const isAllowed = resolvedAllowedDirs.some((allowedDir) => {
      const relative = path.relative(allowedDir, realTargetPath);
      return !relative.startsWith('..') && !path.isAbsolute(relative);
    });

    if (!isAllowed) {
      throw new PdfSecurityError(
        `Access to path "${targetPath}" is forbidden. It is outside allowed directories: ${allowedDirectories.join(', ')}`,
        { targetPath, realTargetPath, allowedDirectories },
      );
    }

    return realTargetPath;
  }

  /**
   * Validates a URL against SSRF rules, checking schema, whitelist, userinfo, and resolved IP addresses.
   */
  public static async validateUrl(
    urlString: string,
    options: {
      allowedDomains?: string[];
      allowExternalResources?: boolean;
    } = {},
  ): Promise<URL> {
    if (!options.allowExternalResources) {
      throw new PdfSecurityError(
        'External resource loading is disabled by security policy (allowExternalResources is false)',
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new PdfSecurityError(`Invalid URL format: "${urlString}"`);
    }

    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new PdfSecurityError(
        `Protocol "${parsed.protocol}" is not permitted. Only "http:" and "https:" are allowed`,
      );
    }

    // Forbid userinfo credentials in URL
    if (parsed.username || parsed.password) {
      throw new PdfSecurityError('Credentials (userinfo) in URL are prohibited');
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check allowed domains whitelist if configured
    if (options.allowedDomains && options.allowedDomains.length > 0) {
      const isDomainWhitelisted = options.allowedDomains.some((allowedDomain) => {
        const domain = allowedDomain.toLowerCase().trim();
        return hostname === domain || hostname.endsWith(`.${domain}`);
      });

      if (!isDomainWhitelisted) {
        throw new PdfSecurityError(
          `Domain "${hostname}" is not in the allowed domains list: ${options.allowedDomains.join(', ')}`,
        );
      }
    }

    // Resolve DNS to verify IP addresses against private/loopback/link-local ranges
    await this.validateHostIp(hostname);

    return parsed;
  }

  /**
   * Resolves the hostname to IP addresses and verifies that none belong to private, loopback,
   * multicast, or reserved networks (SSRF & DNS rebinding defense).
   */
  public static async validateHostIp(hostname: string): Promise<void> {
    const directIp = this.parseIpAddress(hostname);
    if (directIp) {
      if (this.isPrivateOrReservedIp(directIp)) {
        throw new PdfSecurityError(`Direct access to private or reserved IP "${directIp}" is prohibited`);
      }
      return;
    }

    let records: dns.LookupAddress[];
    try {
      records = await dns.promises.lookup(hostname, { all: true, verbatim: true });
    } catch (err) {
      throw new PdfSecurityError(`DNS resolution failed for host "${hostname}"`, {
        originalError: err instanceof Error ? err.message : String(err),
      });
    }

    if (!records || records.length === 0) {
      throw new PdfSecurityError(`DNS resolution returned no records for host "${hostname}"`);
    }

    for (const record of records) {
      if (this.isPrivateOrReservedIp(record.address)) {
        throw new PdfSecurityError(
          `Host "${hostname}" resolved to prohibited private/reserved IP: ${record.address}`,
          { hostname, resolvedIp: record.address },
        );
      }
    }
  }

  /**
   * Attempts to parse an IP address, handling standard notation, decimal (DWORD), octal, hex, and IPv6.
   */
  public static parseIpAddress(host: string): string | null {
    if (net.isIP(host)) {
      return host;
    }

    // DWORD
    if (/^\d+$/.test(host)) {
      const num = parseInt(host, 10);
      if (num >= 0 && num <= 0xffffffff) {
        return [
          (num >>> 24) & 255,
          (num >>> 16) & 255,
          (num >>> 8) & 255,
          num & 255,
        ].join('.');
      }
    }

    // Hex
    if (/^0x[0-9a-fA-F]+$/.test(host)) {
      const num = parseInt(host, 16);
      if (num >= 0 && num <= 0xffffffff) {
        return [
          (num >>> 24) & 255,
          (num >>> 16) & 255,
          (num >>> 8) & 255,
          num & 255,
        ].join('.');
      }
    }

    // Octal or mixed
    const parts = host.split('.');
    if (parts.length === 4) {
      const octets: number[] = [];
      for (const part of parts) {
        let val: number;
        if (part.startsWith('0x') || part.startsWith('0X')) {
          val = parseInt(part, 16);
        } else if (part.length > 1 && part.startsWith('0')) {
          val = parseInt(part, 8);
        } else if (/^\d+$/.test(part)) {
          val = parseInt(part, 10);
        } else {
          return null;
        }
        if (isNaN(val) || val < 0 || val > 255) {
          return null;
        }
        octets.push(val);
      }
      return octets.join('.');
    }

    return null;
  }

  /**
   * Checks whether an IP address is loopback, private (RFC1918), link-local, multicast, or reserved.
   */
  public static isPrivateOrReservedIp(ip: string): boolean {
    let checkIp = ip;
    if (checkIp.startsWith('::ffff:')) {
      checkIp = checkIp.slice(7);
    }

    if (net.isIPv4(checkIp)) {
      const parts = checkIp.split('.').map((p) => parseInt(p, 10));
      const [a, b] = parts;

      if (a === 0) return true;
      if (a === 127) return true;
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 169 && b === 254) return true;
      if (a === 100 && b >= 64 && b <= 127) return true;
      if (a === 192 && b === 0 && parts[2] === 0) return true;
      if (a === 192 && b === 0 && parts[2] === 2) return true;
      if (a === 198 && b === 51 && parts[2] === 100) return true;
      if (a === 203 && b === 0 && parts[2] === 113) return true;
      if (a >= 224 && a <= 239) return true;
      if (a >= 240) return true;
      if (checkIp === '255.255.255.255') return true;

      return false;
    }

    if (net.isIPv6(checkIp)) {
      const lower = checkIp.toLowerCase();
      if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
      if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;
      if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
      if (
        lower.startsWith('fe8') ||
        lower.startsWith('fe9') ||
        lower.startsWith('fea') ||
        lower.startsWith('feb')
      ) {
        return true;
      }
      if (lower.startsWith('ff')) return true;
      if (lower.startsWith('100:')) return true;

      return false;
    }

    return true;
  }
}
