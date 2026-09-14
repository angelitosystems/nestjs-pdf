# Guía de Instalación

`@angelitosystems/nestjs-pdf` es una librería empresarial para la generación de PDFs en NestJS impulsada por `playwright-core`.

## Gestores de Paquetes

Instala el paquete con tu gestor preferido:

```bash
# Bun
bun add @angelitosystems/nestjs-pdf

# NPM
npm install @angelitosystems/nestjs-pdf

# PNPM
pnpm add @angelitosystems/nestjs-pdf

# Yarn
yarn add @angelitosystems/nestjs-pdf
```

## ¿Por qué `playwright-core`?

Las librerías tradicionales de Playwright descargan automáticamente binarios pesados de Chromium (~500MB) durante la instalación. Este paquete utiliza exclusivamente `playwright-core`, asegurando:

1. **Instalación Ultrarrápida**: 0 MB de descargas automáticas durante `npm install` o `bun add`.
2. **Cero Sobrecarga en CI/CD**: Los pipelines de integración continua no gastan tiempo ni ancho de banda descargando navegadores redundantes.
3. **Optimizado para Docker**: Las imágenes de producción pueden usar el Chromium nativo del sistema operativo (`/usr/bin/chromium`).

## Requisitos del Sistema

Para renderizar HTML, CSS moderno, Flexbox y Grid, el sistema anfitrión requiere un navegador basado en Chromium:
- **Google Chrome** (Windows, Linux, macOS)
- **Microsoft Edge** (Windows, Linux, macOS)
- **Chromium** (Windows, Linux, macOS)

Si ya tienes cualquiera de estos navegadores instalados en tu sistema operativo, `@angelitosystems/nestjs-pdf` lo detectará y utilizará automáticamente sin configuración manual.

## Verificación con CLI Doctor

Ejecuta la herramienta de diagnóstico integrada para verificar tu entorno:

```bash
bunx angelito-pdf doctor
# o
npx angelito-pdf doctor
```
