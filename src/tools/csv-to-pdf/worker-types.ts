export interface CsvToPdfWorkerInput {
  text: string;
  separator: string;
  hasHeader: boolean;
}

export interface CsvToPdfWorkerResult {
  bytes: Uint8Array;
}
