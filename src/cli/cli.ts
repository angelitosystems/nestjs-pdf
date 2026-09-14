#!/usr/bin/env node

import { BrowserDetector } from '../browser/browser-detector';

function getOsName(): string {
  switch (process.platform) {
    case 'win32':
      return 'Windows';
    case 'darwin':
      return 'macOS';
    case 'linux':
      return 'Linux';
    default:
      return process.platform;
  }
}

function printHeader(): void {
  console.log('╭────────────────────────────────────────────╮');
  console.log('│        Angelito Systems PDF Engine         │');
  console.log('╰────────────────────────────────────────────╯');
  console.log('');
}

function runDoctor(): void {
  printHeader();

  console.log('✓ @angelitosystems/nestjs-pdf');
  console.log('✓ playwright-core');
  console.log(`✓ Operating system: ${getOsName()} (${process.arch})`);
  console.log(`✓ Runtime: ${typeof process.versions.bun !== 'undefined' ? `Bun v${process.versions.bun}` : `Node.js ${process.version}`}`);
  console.log('');

  console.log('Browser detection:');
  console.log('');

  const detectedBrowsers = BrowserDetector.findAll();

  if (detectedBrowsers.length > 0) {
    for (const browser of detectedBrowsers) {
      console.log(`✓ ${browser.name}`);
      console.log(`  ${browser.executablePath}`);
    }
    console.log('');
    console.log('PDF engine is ready.');
    process.exit(0);
  } else {
    console.log('✗ No compatible browser found.');
    console.log('');
    console.log('The PDF engine requires a Chromium-based browser');
    console.log('to render HTML and CSS.');
    console.log('');
    console.log('Solutions:');
    console.log('');
    console.log('1. Install Google Chrome / Chromium / Edge');
    console.log('2. Configure browser.executablePath');
    console.log('3. Use a remote browser through CDP');
    console.log('');
    console.log('Example:');
    console.log('');
    console.log('PdfModule.forRoot({');
    console.log('  browser: {');
    console.log("    executablePath: '...',");
    console.log('  },');
    console.log('});');
    console.log('');
    process.exit(1);
  }
}

function printHelp(): void {
  printHeader();
  console.log('Usage: angelito-pdf <command>');
  console.log('');
  console.log('Commands:');
  console.log('  doctor    Check system readiness and detect installed browsers');
  console.log('  help      Show this help information');
  console.log('');
}

const args = process.argv.slice(2);
const command = args[0] || 'doctor';

switch (command) {
  case 'doctor':
    runDoctor();
    break;
  case '--help':
  case '-h':
  case 'help':
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
