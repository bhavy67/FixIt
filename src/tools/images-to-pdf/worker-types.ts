import type { ImageToPdfOptions } from '@/core/image-to-pdf';

export interface ImagesToPdfWorkerInput {
  buffers: ArrayBuffer[];
  mimes: string[];
  options: ImageToPdfOptions;
}

export interface ImagesToPdfWorkerResult {
  bytes: Uint8Array;
}
