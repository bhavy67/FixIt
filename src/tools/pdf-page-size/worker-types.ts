import type { PdfPageSizeOptions } from './options';

export interface PdfPageSizeWorkerInput {
  buffer: ArrayBuffer;
  options: PdfPageSizeOptions;
}

export type PdfPageSizeWorkerResult =
  | { kind: 'json'; json: string }
  | { kind: 'pdf'; bytes: Uint8Array };
