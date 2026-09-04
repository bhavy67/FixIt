import type { PdfFormFillOptions } from './options';

export interface PdfFormFillWorkerInput {
  buffer: ArrayBuffer;
  options: PdfFormFillOptions;
}

export type PdfFormFillWorkerResult =
  | { kind: 'json'; json: string }
  | { kind: 'pdf'; bytes: Uint8Array; warnings: string[] };
