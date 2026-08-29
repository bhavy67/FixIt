export interface PdfMergeWorkerInput {
  buffers: ArrayBuffer[];
}

export interface PdfMergeWorkerResult {
  bytes: Uint8Array;
}
