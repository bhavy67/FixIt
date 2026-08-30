export interface PdfEncryptWorkerInput {
  buffer: ArrayBuffer;
  userPassword: string;
  ownerPassword: string;
}

export interface PdfEncryptWorkerResult {
  bytes: Uint8Array;
}
