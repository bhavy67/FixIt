import type { PdfInvertColorsOptions } from './options';

export interface PdfInvertColorsWorkerInput {
  buffer: ArrayBuffer;
  options: PdfInvertColorsOptions;
}

export interface PdfInvertColorsWorkerResult {
  bytes: Uint8Array;
}
