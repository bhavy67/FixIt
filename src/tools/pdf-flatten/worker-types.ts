export interface PdfFlattenWorkerInput {
  buffer: ArrayBuffer;
}

export interface PdfFlattenWorkerResult {
  bytes: Uint8Array;
}
