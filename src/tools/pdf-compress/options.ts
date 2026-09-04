export type PdfCompressLevel = 'lossless' | 'light' | 'strong';

export interface PdfCompressOptions {
  level: PdfCompressLevel;
  stripMetadata: boolean;
}

export const DEFAULT_OPTIONS: PdfCompressOptions = {
  level: 'lossless',
  stripMetadata: true,
};
