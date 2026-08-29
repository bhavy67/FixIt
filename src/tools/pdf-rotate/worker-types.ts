export interface PdfRotateWorkerInput {
  buffer: ArrayBuffer;
  degrees: number;
  pages: string;
}

export interface PdfRotateWorkerResult {
  bytes: Uint8Array;
}
