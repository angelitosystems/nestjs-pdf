#!/usr/bin/env node

/**
 * Script interactivo de despliegue inicial y publicación a NPM para @angelitosystems/nestjs-pdf
 * 
 * Uso:
 *   npm run deploy:npm
 *   node scripts/deploy.mjs [--otp=123456] [--skip-tests]
 */

import { execSync, spawnSync } from 'node:child_process';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function runStep(title, command, options = {}) {
  console.log(`\n${colors.cyan}▶ ${title}${colors.reset}`);
  console.log(`${colors.gray}$ ${command}${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit', ...options });
    console.log(`${colors.green}✔ ${title} completado con éxito.${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}✖ Falló: ${title}${colors.reset}`);
    process.exit(1);
  }
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.clear();
  log(`=======================================================`, colors.cyan);
  log(` 🚀  @angelitosystems/nestjs-pdf - Despliegue en NPM  `, colors.bright + colors.cyan);
  log(`=======================================================`, colors.cyan);

  const pkgJsonPath = path.resolve('package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    log('No se encontró package.json en el directorio actual.', colors.red);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  const packageName = pkg.name;
  const packageVersion = pkg.version;

  log(`Paquete: ${packageName}`, colors.yellow);
  log(`Versión a publicar: v${packageVersion}`, colors.yellow);

  // 1. Verificar sesión en NPM
  log(`\n${colors.cyan}▶ Verificando sesión en npm...${colors.reset}`);
  let npmUser = '';
  try {
    npmUser = execSync('npm whoami', { encoding: 'utf-8' }).trim();
    log(`✔ Sesión activa en npm como: ${colors.bright}${npmUser}${colors.green}`, colors.green);
  } catch {
    log(`✖ No has iniciado sesión en npm.`, colors.red);
    log(`Por favor ejecuta primero:`, colors.yellow);
    log(`  npm login`, colors.bright + colors.cyan);
    process.exit(1);
  }

  // Comprobar argumentos CLI
  const args = process.argv.slice(2);
  let otpArg = args.find((a) => a.startsWith('--otp='))?.split('=')[1];
  const skipTests = args.includes('--skip-tests');

  // 2. Control de calidad
  log(`\n${colors.bright}--- Ejecutando Quality Gates ---${colors.reset}`);

  runStep('Auditoría de seguridad (0 vulnerabilidades)', 'npm audit --audit-level=high');
  runStep('Verificación de tipos TypeScript', 'npm run typecheck');
  runStep('Análisis de linter (ESLint)', 'npm run lint');

  if (!skipTests) {
    runStep('Suite de pruebas (Jest)', 'npm test');
  } else {
    log('⚠ Omitiendo tests según argumento --skip-tests', colors.yellow);
  }

  runStep('Compilación de la librería (CJS, ESM, DTS)', 'npm run build');

  // 3. Dry-run de npm pack
  runStep('Verificación de empaquetado (dry-run)', 'npm pack --dry-run');

  // 4. Confirmación interactiva
  log(`\n${colors.yellow}=======================================================${colors.reset}`);
  log(`¿Estás seguro de publicar ${colors.bright}${packageName}@${packageVersion}${colors.reset}${colors.yellow} en NPM?`, colors.yellow);
  log(`Acceso: ${colors.green}public${colors.reset}`);
  log(`Usuario npm: ${colors.green}${npmUser}${colors.reset}`);
  log(`${colors.yellow}=======================================================${colors.reset}`);

  const confirmation = await askQuestion(`Escribe 'si' o 'y' para proceder con la publicación: `);
  if (confirmation.toLowerCase() !== 'si' && confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 's') {
    log(`\nPublicación cancelada por el usuario.`, colors.yellow);
    process.exit(0);
  }

  // 5. Soporte para 2FA OTP si es requerido
  if (!otpArg) {
    const has2FA = await askQuestion(`Si tu cuenta npm tiene 2FA (TOTP / Authenticator), ingresa el código de 6 dígitos (o presiona Enter si no tienes): `);
    if (has2FA && has2FA.trim().length > 0) {
      otpArg = has2FA.trim();
    }
  }

  // 6. Publicación en NPM
  const publishCmdArgs = ['publish', '--access', 'public'];
  if (otpArg) {
    publishCmdArgs.push(`--otp=${otpArg}`);
  }

  log(`\n${colors.cyan}▶ Publicando paquete en el registro público de npm...${colors.reset}`);
  log(`${colors.gray}$ npm ${publishCmdArgs.join(' ')}${colors.reset}`);

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const publishResult = spawnSync(npmCmd, publishCmdArgs, {
    stdio: 'inherit',
  });

  if (publishResult.status !== 0) {
    log(`\n✖ Error al publicar el paquete en NPM.`, colors.red);
    log(`Si el error fue por 2FA (código OTP expirado o incorrecto), puedes reintentar pasando:`, colors.yellow);
    log(`  node scripts/deploy.mjs --otp=CODIGO_2FA`, colors.cyan);
    process.exit(publishResult.status || 1);
  }

  // 7. Éxito
  log(`\n=======================================================`, colors.green);
  log(` 🎉 ¡PUBLICACIÓN EXITOSA EN NPM!`, colors.bright + colors.green);
  log(`=======================================================`, colors.green);
  log(`\nPuedes consultar tu paquete publicado en:`, colors.reset);
  log(`🔗 https://www.npmjs.com/package/${packageName}\n`, colors.bright + colors.cyan);
  log(`Para instalarlo en cualquier proyecto NestJS:`, colors.reset);
  log(`  npm install ${packageName} playwright-core\n`, colors.yellow);
}

main().catch((err) => {
  console.error('\nError inesperado durante el despliegue:', err);
  process.exit(1);
});

