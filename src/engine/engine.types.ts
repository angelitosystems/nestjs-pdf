import { PdfDimensions, PdfFormat, PdfMargins, PdfMetadata, PdfOrientation } from '../common/types/pdf.types';

export interface EngineRenderOptions {
  html: string;
  format?: PdfFormat;
  dimensions?: PdfDimensions;
  orientation?: PdfOrientation;
  margins?: PdfMargins;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
  scale?: number;
  pageRanges?: string;
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  metadata?: PdfMetadata;
  timeout?: number;
  signal?: AbortSignal;
}

export type PdfEngineOptions = EngineRenderOptions;
