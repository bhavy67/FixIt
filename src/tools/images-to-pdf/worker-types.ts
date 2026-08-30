export interface ImagesToPdfWorkerInput {
  buffers: ArrayBuffer[];
  mimes: string[];
}

export interface ImagesToPdfWorkerResult {
  bytes: Uint8Array;
}
