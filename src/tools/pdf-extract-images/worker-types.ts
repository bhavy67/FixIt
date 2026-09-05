import type { PdfExtractImagesOptions } from './options';

export interface PdfExtractImagesWorkerInput {
  buffer: ArrayBuffer;
  options: PdfExtractImagesOptions;
  basename: string;
}

export interface ExtractedImage {
  filename: string;
  bytes: Uint8Array;
  mime: string;
}

export interface PdfExtractImagesWorkerResult {
  images: ExtractedImage[];
}
