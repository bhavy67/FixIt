export type MarginUnit = 'mm' | 'pt';

export type PdfCropOptions = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: MarginUnit;
};

export const DEFAULT_OPTIONS: PdfCropOptions = {
  top: 20,
  right: 15,
  bottom: 20,
  left: 15,
  unit: 'mm',
};
