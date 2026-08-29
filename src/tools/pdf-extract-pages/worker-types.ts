export interface PdfExtractWorkerInput {
  buffer: ArrayBuffer;
  pages: string;
}

export interface PdfExtractWorkerResult {
  bytes: Uint8Array;
}
