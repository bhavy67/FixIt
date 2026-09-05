export type RenderScale = 1 | 2 | 3;

export interface PdfToWebpOptions {
  quality: number;
  scale: RenderScale;
  bundle: boolean;
}

export const DEFAULT_OPTIONS: PdfToWebpOptions = { quality: 0.85, scale: 2, bundle: false };
