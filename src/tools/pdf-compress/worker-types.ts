export interface PdfCompressWorkerInput {
  buffer: ArrayBuffer;
  stripMetadata: boolean;
}

export interface PdfCompressWorkerResult {
  bytes: Uint8Array;
}
