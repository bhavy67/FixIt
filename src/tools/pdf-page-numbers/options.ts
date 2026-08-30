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
  prefix: string;
  fontSize: number;
}

export const DEFAULT_OPTIONS: PdfPageNumbersOptions = {
  position: 'bottom-center',
  startNumber: 1,
  prefix: '',
  fontSize: 10,
};

export const POSITION_LABELS: Record<PageNumberPosition, string> = {
  'bottom-center': 'Bottom center',
  'bottom-right': 'Bottom right',
  'bottom-left': 'Bottom left',
  'top-center': 'Top center',
  'top-right': 'Top right',
  'top-left': 'Top left',
};
