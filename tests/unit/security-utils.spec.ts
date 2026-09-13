import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { SecurityUtils } from '../../src/utils/security.utils';
import { PdfSecurityError } from '../../src/pdf/pdf.exceptions';

describe('SecurityUtils', () => {
  describe('validatePathTraversal', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdf-sec-test-'));
    const safeSubdir = path.join(tempDir, 'templates');
    fs.mkdirSync(safeSubdir, { recursive: true });
    const safeFile = path.join(safeSubdir, 'invoice.hbs');
    fs.writeFileSync(safeFile, 'hello');

    afterAll(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should allow valid files within allowed directory', () => {
      const result = SecurityUtils.validatePathTraversal(safeFile, [safeSubdir]);
      expect(result).toBe(fs.realpathSync(safeFile));
    });

    it('should reject relative path traversal outside allowed directory', () => {
      const maliciousPath = path.join(safeSubdir, '../other.txt');
      expect(() => {
        SecurityUtils.validatePathTraversal(maliciousPath, [safeSubdir]);
      }).toThrow(PdfSecurityError);
    });

    it('should reject URL-encoded traversal (%2e%2e%2f)', () => {
      const maliciousEncoded = path.join(safeSubdir, '%2e%2e/secret.txt');
      expect(() => {
        SecurityUtils.validatePathTraversal(maliciousEncoded, [safeSubdir]);
      }).toThrow(PdfSecurityError);
    });

    it('should reject null bytes in path', () => {
      expect(() => {
        SecurityUtils.validatePathTraversal(`${safeFile}\0.jpg`, [safeSubdir]);
      }).toThrow(PdfSecurityError);
    });

    it('should reject symlinks pointing outside allowed directory', () => {
      const outsideFile = path.join(tempDir, 'outside.txt');
      fs.writeFileSync(outsideFile, 'secret content');

      const symlinkInside = path.join(safeSubdir, 'symlink-outside');
      try {
        fs.symlinkSync(outsideFile, symlinkInside);
        expect(() => {
          SecurityUtils.validatePathTraversal(symlinkInside, [safeSubdir]);
        }).toThrow(PdfSecurityError);
      } catch (e) {
        // In Windows, symlinks may require developer mode or elevated privileges
        if ((e as { code?: string }).code !== 'EPERM') {
          throw e;
        }
      }
    });
  });

  describe('isPrivateOrReservedIp', () => {
    it('should detect IPv4 loopback (127.0.0.0/8)', () => {
      expect(SecurityUtils.isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('127.1.2.3')).toBe(true);
    });

    it('should detect RFC1918 private subnets', () => {
      // 10.0.0.0/8
      expect(SecurityUtils.isPrivateOrReservedIp('10.0.0.1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('10.255.255.255')).toBe(true);

      // 172.16.0.0/12
      expect(SecurityUtils.isPrivateOrReservedIp('172.16.0.1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('172.31.255.254')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('172.32.0.1')).toBe(false);

      // 192.168.0.0/16
      expect(SecurityUtils.isPrivateOrReservedIp('192.168.1.1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('192.168.100.50')).toBe(true);
    });

    it('should detect AWS/GCP cloud metadata IP (169.254.169.254)', () => {
      expect(SecurityUtils.isPrivateOrReservedIp('169.254.169.254')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('169.254.1.1')).toBe(true);
    });

    it('should detect 0.0.0.0 and broadcast 255.255.255.255', () => {
      expect(SecurityUtils.isPrivateOrReservedIp('0.0.0.0')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('255.255.255.255')).toBe(true);
    });

    it('should detect IPv6 loopback, local and unique local addresses', () => {
      expect(SecurityUtils.isPrivateOrReservedIp('::1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('::')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('fe80::1')).toBe(true); // link-local
      expect(SecurityUtils.isPrivateOrReservedIp('fc00::1')).toBe(true); // unique local
      expect(SecurityUtils.isPrivateOrReservedIp('fd12:3456:789a::1')).toBe(true);
      expect(SecurityUtils.isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true); // IPv4-mapped IPv6
    });

    it('should allow legitimate public IP addresses', () => {
      expect(SecurityUtils.isPrivateOrReservedIp('8.8.8.8')).toBe(false);
      expect(SecurityUtils.isPrivateOrReservedIp('1.1.1.1')).toBe(false);
      expect(SecurityUtils.isPrivateOrReservedIp('142.250.190.46')).toBe(false);
    });
  });

  describe('parseIpAddress', () => {
    it('should parse standard decimal notation', () => {
      expect(SecurityUtils.parseIpAddress('127.0.0.1')).toBe('127.0.0.1');
    });

    it('should parse DWORD / integer notation bypass (e.g. 2130706433 -> 127.0.0.1)', () => {
      expect(SecurityUtils.parseIpAddress('2130706433')).toBe('127.0.0.1');
    });

    it('should parse hex notation bypass (e.g. 0x7f000001 -> 127.0.0.1)', () => {
      expect(SecurityUtils.parseIpAddress('0x7f000001')).toBe('127.0.0.1');
    });

    it('should parse octal notation bypass (e.g. 0177.0.0.1 -> 127.0.0.1)', () => {
      expect(SecurityUtils.parseIpAddress('0177.0.0.1')).toBe('127.0.0.1');
    });
  });

  describe('validateUrl', () => {
    it('should reject when allowExternalResources is false', async () => {
      await expect(
        SecurityUtils.validateUrl('https://example.com/logo.png', {
          allowExternalResources: false,
        }),
      ).rejects.toThrow(PdfSecurityError);
    });

    it('should reject file:// and other non-http protocols', async () => {
      await expect(
        SecurityUtils.validateUrl('file:///etc/passwd', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);

      await expect(
        SecurityUtils.validateUrl('ftp://example.com/resource', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);
    });

    it('should reject URLs with userinfo credentials', async () => {
      await expect(
        SecurityUtils.validateUrl('https://admin:password@example.com/logo.png', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);
    });

    it('should enforce allowedDomains whitelist', async () => {
      await expect(
        SecurityUtils.validateUrl('https://attacker.com/logo.png', {
          allowExternalResources: true,
          allowedDomains: ['example.com', 'cdn.company.com'],
        }),
      ).rejects.toThrow(PdfSecurityError);
    });

    it('should reject direct access to private IPs (localhost, 127.0.0.1, 169.254.169.254)', async () => {
      await expect(
        SecurityUtils.validateUrl('http://127.0.0.1:8080/metrics', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);

      await expect(
        SecurityUtils.validateUrl('http://169.254.169.254/latest/meta-data/', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);

      await expect(
        SecurityUtils.validateUrl('http://localhost:3000/api', {
          allowExternalResources: true,
        }),
      ).rejects.toThrow(PdfSecurityError);
    });
  });
});

