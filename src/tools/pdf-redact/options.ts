export type PdfRedactOptions = {
  patterns: string;
  caseSensitive: boolean;
};

export const DEFAULT_OPTIONS: PdfRedactOptions = {
  patterns: '',
  caseSensitive: false,
};
