export type ColorFilter = 'invert' | 'grayscale' | 'sepia';

export interface PdfInvertColorsOptions {
  filter: ColorFilter;
}

export const DEFAULT_OPTIONS: PdfInvertColorsOptions = { filter: 'invert' };

export const FILTER_LABELS: Record<ColorFilter, string> = {
  invert: 'Invert (dark mode)',
  grayscale: 'Grayscale',
  sepia: 'Sepia',
};
