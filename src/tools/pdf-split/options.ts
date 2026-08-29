export type SplitMode = 'each-page' | 'custom';

export interface PdfSplitOptions {
  mode: SplitMode;
  ranges: string;
}

export const DEFAULT_OPTIONS: PdfSplitOptions = { mode: 'each-page', ranges: '' };
