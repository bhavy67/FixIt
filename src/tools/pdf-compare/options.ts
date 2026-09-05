export interface PdfCompareOptions {
  scale: 1 | 2;
  threshold: number;
}

export const DEFAULT_OPTIONS: PdfCompareOptions = {
  scale: 1,
  threshold: 15,
};
