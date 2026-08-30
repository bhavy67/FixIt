export interface PdfRepairWorkerInput {
  buffer: ArrayBuffer;
}

export interface PdfRepairWorkerResult {
  bytes: Uint8Array;
}
