export interface PdfUnlockWorkerInput {
  buffer: ArrayBuffer;
  password: string;
}

export interface PdfUnlockWorkerResult {
  bytes: Uint8Array;
}
