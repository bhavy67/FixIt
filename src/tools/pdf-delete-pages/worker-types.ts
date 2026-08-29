export interface PdfDeleteWorkerInput {
  buffer: ArrayBuffer;
  pages: string;
  originalName: string;
}

export interface PdfDeleteWorkerResult {
  bytes: Uint8Array;
}
