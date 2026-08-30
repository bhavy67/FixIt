export type RenderScale = 1 | 2 | 3;

export interface PdfToPngOptions {
  scale: RenderScale;
}

export const DEFAULT_OPTIONS: PdfToPngOptions = { scale: 2 };
