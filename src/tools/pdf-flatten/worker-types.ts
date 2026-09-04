import type { PdfFlattenOptions } from './options';

export interface PdfFlattenWorkerInput {
  buffer: ArrayBuffer;
  options: PdfFlattenOptions;
}

export interface PdfFlattenWorkerResult {
  bytes: Uint8Array;
}
