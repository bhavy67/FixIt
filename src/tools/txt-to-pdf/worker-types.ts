export interface TxtToPdfWorkerInput {
  text: string;
  fontSize: number;
}

export interface TxtToPdfWorkerResult {
  bytes: Uint8Array;
}
