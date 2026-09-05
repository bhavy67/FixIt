import type { PdfRedactOptions } from './options';

export interface PdfRedactWorkerInput {
  buffer: ArrayBuffer;
  options: PdfRedactOptions;
}

export interface PdfRedactWorkerResult {
  bytes: Uint8Array;
}
