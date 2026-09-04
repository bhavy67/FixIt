/**
 * Shared image-to-PDF engine used by jpg-to-pdf, png-to-pdf, images-to-pdf.
 *
 * All three tools take a batch of raster images and produce a single PDF. The
 * historical implementation treated image pixel dimensions as PDF points,
 * producing pages ~4× too large (a 3000×2000 photo became a 42×28 inch page).
 * This module fixes that and adds standard page-size / orientation / margin
 * options.
 */

export type PageSize = 'fit-image' | 'a4' | 'letter' | 'legal';
export type Orientation = 'auto' | 'portrait' | 'landscape';

export interface ImageToPdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  marginMm: number;
}

export const DEFAULT_IMAGE_TO_PDF_OPTIONS: ImageToPdfOptions = {
  pageSize: 'a4',
  orientation: 'auto',
  marginMm: 5,
};

/** Page sizes in PDF points (1 pt = 1/72 inch). */
const PAGE_SIZES_PT: Record<Exclude<PageSize, 'fit-image'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
  legal: [612, 1008],
};

const MM_TO_PT = 2.83464567;

/**
 * "fit-image" treats image pixels at 96 DPI (screen density). A 3000-pixel
 * image becomes 3000 * 72 / 96 = 2250 pt ≈ 31.25 inch. Still large for a phone
 * photo, but the user explicitly asked for image-native sizing.
 */
const FIT_IMAGE_DPI = 96;
const FIT_IMAGE_FACTOR = 72 / FIT_IMAGE_DPI;

function isJpeg(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 3);
  return v[0] === 0xff && v[1] === 0xd8 && v[2] === 0xff;
}

function isPng(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 4);
  return v[0] === 0x89 && v[1] === 0x50 && v[2] === 0x4e && v[3] === 0x47;
}

async function toPngBuffer(buf: ArrayBuffer, mime: string): Promise<ArrayBuffer> {
  const blob = new Blob([buf], { type: mime || 'image/*' });
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const c = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
  if (!c) throw new Error('OffscreenCanvas unavailable');
  c.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  return pngBlob.arrayBuffer();
}

function resolvePageSize(
  options: ImageToPdfOptions,
  imgW: number,
  imgH: number,
): [number, number] {
  if (options.pageSize === 'fit-image') {
    return [imgW * FIT_IMAGE_FACTOR, imgH * FIT_IMAGE_FACTOR];
  }
  const [w, h] = PAGE_SIZES_PT[options.pageSize];
  const imageIsLandscape = imgW > imgH;
  if (options.orientation === 'landscape') return [Math.max(w, h), Math.min(w, h)];
  if (options.orientation === 'portrait') return [Math.min(w, h), Math.max(w, h)];
  // 'auto' — match image orientation
  return imageIsLandscape ? [Math.max(w, h), Math.min(w, h)] : [Math.min(w, h), Math.max(w, h)];
}

export interface BuildImagePdfArgs {
  buffers: ArrayBuffer[];
  mimes: string[];
  options: ImageToPdfOptions;
  onProgress?: (fraction: number) => void;
}

/**
 * Embeds each image on its own page. For fixed page sizes, images are scaled
 * to fit within the page (minus margins) preserving aspect ratio and centered.
 * For 'fit-image', the page matches the image and margin is ignored.
 */
export async function buildImagePdf(args: BuildImagePdfArgs): Promise<Uint8Array> {
  const { buffers, mimes, options, onProgress } = args;
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();

  for (let i = 0; i < buffers.length; i++) {
    let buf = buffers[i]!;
    const mime = mimes[i] ?? '';

    let embedded;
    if (isJpeg(buf)) {
      embedded = await doc.embedJpg(buf);
    } else if (isPng(buf)) {
      embedded = await doc.embedPng(buf);
    } else {
      buf = await toPngBuffer(buf, mime);
      embedded = await doc.embedPng(buf);
    }

    const imgW = embedded.width;
    const imgH = embedded.height;
    const [pageW, pageH] = resolvePageSize(options, imgW, imgH);
    const page = doc.addPage([pageW, pageH]);

    if (options.pageSize === 'fit-image') {
      page.drawImage(embedded, { x: 0, y: 0, width: pageW, height: pageH });
    } else {
      const marginPt = Math.max(0, options.marginMm) * MM_TO_PT;
      const availW = Math.max(1, pageW - marginPt * 2);
      const availH = Math.max(1, pageH - marginPt * 2);
      const scale = Math.min(availW / imgW, availH / imgH);
      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;
      page.drawImage(embedded, { x, y, width: drawW, height: drawH });
    }

    onProgress?.((i + 1) / buffers.length);
  }

  return doc.save();
}
