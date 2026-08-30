export type ImageFormat = 'png' | 'jpeg';

export type PdfExtractImagesOptions = {
  format: ImageFormat;
  quality: number; // 50–100, JPEG only
  minSize: number; // minimum width/height in px to include (filter tiny icons)
};

export const DEFAULT_OPTIONS: PdfExtractImagesOptions = {
  format: 'png',
  quality: 90,
  minSize: 64,
};
