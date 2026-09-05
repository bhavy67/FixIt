import type { PdfPageNumbersOptions } from './options';

export interface PdfPageNumbersWorkerInput {
  buffer: ArrayBuffer;
  options: PdfPageNumbersOptions;
}

export interface PdfPageNumbersWorkerResult {
  bytes: Uint8Array;
}
