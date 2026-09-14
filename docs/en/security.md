# Security & SSRF Hardening

`@angelitosystems/nestjs-pdf` incorporates comprehensive defense-in-depth measures to protect your servers against SSRF, arbitrary file read, and resource exhaustion attacks.

## 1. SSRF Protection (Server-Side Request Forgery)

By default, loading external web resources is completely disabled (`allowExternalResources: false`).

When external resources are enabled, every requested asset URL must pass strict security checks:
- **Domain Whitelist**: Only domains specified in `allowedDomains` can be reached.
- **Private Network Blocking**: IP addresses belonging to private subnets (RFC 1918 `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, RFC 4193 IPv6) are unconditionally rejected.
- **Cloud Metadata Protection**: Cloud instance metadata endpoints (`169.254.169.254` on AWS, GCP, Azure, DigitalOcean) are permanently blocked.
- **Alternative Notation Defense**: Bypasses using decimal (DWORD), octal, or hex IP representations are parsed and blocked.

## 2. Path Traversal & Filesystem Hardening

- **Boundary Enforcement**: Template and asset paths are resolved to their canonical real paths using `fs.realpathSync`.
- **Directory Traversal Filters**: Relative sequences (`../`), encoded dots (`%2e%2e`), null bytes (`%00`), and symlinks escaping the template folder trigger a `PdfSecurityError`.
- **Asset Size Limits**: Assets exceeding `maxAssetSizeBytes` (default: 10MB) are immediately blocked to prevent memory exhaustion.

## 3. Sandboxed Browser Execution

Browser execution flags use strict isolation headers:
- Fresh, unshared `BrowserContext` per generation request.
- Context cookies, local storage, and history are wiped automatically when the request ends.
- Abort signals cleanly kill active pages and prevent zombie renders.
