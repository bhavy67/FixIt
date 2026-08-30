export interface PdfWatermarkOptions {
  text: string;
  opacity: number;
  rotation: number;
  fontSize: number;
}

export const DEFAULT_OPTIONS: PdfWatermarkOptions = {
  text: 'CONFIDENTIAL',
  opacity: 0.2,
  rotation: 45,
  fontSize: 48,
};
