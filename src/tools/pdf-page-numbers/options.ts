export type PageNumberPosition =
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'top-right'
  | 'top-left';

export interface PdfPageNumbersOptions {
  position: PageNumberPosition;
  startNumber: number;
  /** Free-form pattern with {page} and {total} tokens. */
  pattern: string;
  fontSize: number;
  /** Number of leading pages to leave un-numbered (title pages, cover). */
  skipFirstN: number;
}

export const DEFAULT_OPTIONS: PdfPageNumbersOptions = {
  position: 'bottom-center',
  startNumber: 1,
  pattern: '{page}',
  fontSize: 10,
  skipFirstN: 0,
};

export const POSITION_LABELS: Record<PageNumberPosition, string> = {
  'bottom-center': 'Bottom center',
  'bottom-right': 'Bottom right',
  'bottom-left': 'Bottom left',
  'top-center': 'Top center',
  'top-right': 'Top right',
  'top-left': 'Top left',
};
