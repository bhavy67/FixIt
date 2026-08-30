export interface PdfFormFillWorkerInput {
  buffer: ArrayBuffer;
  fields: string;
  flatten: boolean;
}

export interface PdfFormFillWorkerResult {
  bytes: Uint8Array;
}
