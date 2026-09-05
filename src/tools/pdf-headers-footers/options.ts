export type Alignment = 'left' | 'center' | 'right';

export interface PdfHeadersFootersOptions {
  headerText: string;
  footerText: string;
  fontSize: number;
  alignment: Alignment;
  /** Skip N leading pages (title/cover). */
  skipFirstN: number;
}

export const DEFAULT_OPTIONS: PdfHeadersFootersOptions = {
  headerText: '',
  footerText: 'Page {page} of {total}',
  fontSize: 10,
  alignment: 'center',
  skipFirstN: 0,
};
