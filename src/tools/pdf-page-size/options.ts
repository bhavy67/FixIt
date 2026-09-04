export type PdfPageSizeMode = 'inspect' | 'resize';
export type ResizePageSize = 'a4' | 'letter' | 'legal' | 'a3' | 'a5';
export type ResizeOrientation = 'auto' | 'portrait' | 'landscape';

export interface PdfPageSizeOptions {
  mode: PdfPageSizeMode;
  targetSize: ResizePageSize;
  orientation: ResizeOrientation;
}

export const DEFAULT_OPTIONS: PdfPageSizeOptions = {
  mode: 'inspect',
  targetSize: 'a4',
  orientation: 'auto',
};
