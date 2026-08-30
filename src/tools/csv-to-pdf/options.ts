export interface CsvToPdfOptions {
  separator: ',' | ';' | '\t';
  hasHeader: boolean;
}

export const DEFAULT_OPTIONS: CsvToPdfOptions = { separator: ',', hasHeader: true };
