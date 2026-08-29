export interface PdfReorderWorkerInput {
  buffer: ArrayBuffer;
  order: string;
}

export interface PdfReorderWorkerResult {
  bytes: Uint8Array;
}
