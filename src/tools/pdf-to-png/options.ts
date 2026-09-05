export type RenderScale = 1 | 2 | 3;

export interface PdfToPngOptions {
  scale: RenderScale;
  bundle: boolean;
}

export const DEFAULT_OPTIONS: PdfToPngOptions = { scale: 2, bundle: false };
