export type SignPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type SignSize = 'small' | 'medium' | 'large';

export type PdfSignOptions = {
  signatureDataUrl: string;
  page: number;
  position: SignPosition;
  size: SignSize;
};

export const DEFAULT_OPTIONS: PdfSignOptions = {
  signatureDataUrl: '',
  page: 1,
  position: 'bottom-right',
  size: 'medium',
};
