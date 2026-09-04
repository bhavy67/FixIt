export type PdfFormFillMode = 'detect' | 'fill';

export interface PdfFormFillOptions {
  mode: PdfFormFillMode;
  fields: string;
  flatten: boolean;
}

export const DEFAULT_OPTIONS: PdfFormFillOptions = {
  mode: 'fill',
  fields: '',
  flatten: true,
};
