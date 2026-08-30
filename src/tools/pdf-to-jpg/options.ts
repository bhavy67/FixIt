export type RenderScale = 1 | 2 | 3;

export interface PdfToJpgOptions {
  quality: number;
  scale: RenderScale;
}

export const DEFAULT_OPTIONS: PdfToJpgOptions = { quality: 0.9, scale: 2 };
