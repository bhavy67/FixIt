export interface PdfSplitWorkerInput {
  buffer: ArrayBuffer;
  options: { mode: string; ranges: string };
}

export interface PdfSplitWorkerResult {
  files: Array<{ name: string; bytes: Uint8Array }>;
}
