import type { PageNumberPosition } from './options';

export interface PdfPageNumbersWorkerInput {
  buffer: ArrayBuffer;
  position: PageNumberPosition;
  startNumber: number;
  prefix: string;
  fontSize: number;
}

export interface PdfPageNumbersWorkerResult {
  bytes: Uint8Array;
}
