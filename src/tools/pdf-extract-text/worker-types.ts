export interface PdfExtractTextWorkerInput {
  buffer: ArrayBuffer;
}

export interface PdfExtractTextWorkerResult {
  text: string;
}
