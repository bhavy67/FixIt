export interface ImageToPdfWorkerInput {
  buffers: ArrayBuffer[];
  mimes: string[];
}

export interface ImageToPdfWorkerResult {
  bytes: Uint8Array;
}
