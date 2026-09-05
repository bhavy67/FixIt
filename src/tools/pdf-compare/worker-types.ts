import type { PdfCompareOptions } from './options';

export interface PdfCompareWorkerInput {
  buffers: [ArrayBuffer, ArrayBuffer];
  names: [string, string];
  options: PdfCompareOptions;
}

export interface CompareOutput {
  filename: string;
  bytes: Uint8Array;
  mime: string;
}

export interface PdfCompareWorkerResult {
  outputs: CompareOutput[];
}
