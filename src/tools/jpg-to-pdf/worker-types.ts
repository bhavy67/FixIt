import type { ImageToPdfOptions } from '@/core/image-to-pdf';

export interface ImageToPdfWorkerInput {
  buffers: ArrayBuffer[];
  mimes: string[];
  options: ImageToPdfOptions;
}

export interface ImageToPdfWorkerResult {
  bytes: Uint8Array;
}
