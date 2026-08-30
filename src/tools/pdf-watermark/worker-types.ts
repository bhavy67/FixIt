export interface PdfWatermarkWorkerInput {
  buffer: ArrayBuffer;
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
}

export interface PdfWatermarkWorkerResult {
  bytes: Uint8Array;
}
