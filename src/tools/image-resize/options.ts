export type ResizeFit = 'contain' | 'cover' | 'stretch';

export type ResizeFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ImageResizeOptions {
  width: number;
  height: number;
  fit: ResizeFit;
  format: ResizeFormat;
  quality: number; // 0..1, ignored for PNG
}

export const DEFAULT_OPTIONS: ImageResizeOptions = {
  width: 1024,
  height: 1024,
  fit: 'contain',
  format: 'image/webp',
  quality: 0.85,
};

export const FIT_LABELS: Record<ResizeFit, string> = {
  contain: 'Contain (fit inside, letterbox)',
  cover: 'Cover (fill, crop overflow)',
  stretch: 'Stretch (ignore aspect ratio)',
};

export const FORMAT_LABELS: Record<ResizeFormat, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WebP',
};

export const FORMAT_EXT: Record<ResizeFormat, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};
