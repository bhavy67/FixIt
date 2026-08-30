import type { Alignment } from './options';

export interface PdfHeadersFootersWorkerInput {
  buffer: ArrayBuffer;
  headerText: string;
  footerText: string;
  fontSize: number;
  alignment: Alignment;
}

export interface PdfHeadersFootersWorkerResult {
  bytes: Uint8Array;
}
