export type RotateDegrees = 90 | 180 | 270;

export interface PdfRotateOptions {
  degrees: RotateDegrees;
  pages: string;
}

export const DEFAULT_OPTIONS: PdfRotateOptions = { degrees: 90, pages: 'all' };
