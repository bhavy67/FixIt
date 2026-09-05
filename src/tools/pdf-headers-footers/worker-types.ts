import type { PdfHeadersFootersOptions } from './options';

export interface PdfHeadersFootersWorkerInput {
  buffer: ArrayBuffer;
  options: PdfHeadersFootersOptions;
}

export interface PdfHeadersFootersWorkerResult {
  bytes: Uint8Array;
}
