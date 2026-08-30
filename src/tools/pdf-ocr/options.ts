export type OcrLang = 'eng' | 'fra' | 'deu' | 'spa' | 'ita' | 'por';

export type RenderQuality = 'standard' | 'high';

export type PdfOcrOptions = {
  lang: OcrLang;
  quality: RenderQuality;
};

export const DEFAULT_OPTIONS: PdfOcrOptions = {
  lang: 'eng',
  quality: 'high',
};

export const LANG_LABELS: Record<OcrLang, string> = {
  eng: 'English',
  fra: 'French',
  deu: 'German',
  spa: 'Spanish',
  ita: 'Italian',
  por: 'Portuguese',
};

export const QUALITY_LABELS: Record<RenderQuality, string> = {
  standard: 'Standard (faster)',
  high: 'High (more accurate)',
};
