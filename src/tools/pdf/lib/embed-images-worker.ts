/// <reference lib="webworker" />

/** Detect JPEG from magic bytes FF D8 FF */
function isJpeg(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 3);
  return v[0] === 0xff && v[1] === 0xd8 && v[2] === 0xff;
}

/** Detect PNG from magic bytes 89 50 4E 47 */
function isPng(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 4);
  return v[0] === 0x89 && v[1] === 0x50 && v[2] === 0x4e && v[3] === 0x47;
}

/**
 * Convert any image ArrayBuffer to a PNG ArrayBuffer via OffscreenCanvas.
 * Used as a fallback for formats pdf-lib can't embed natively (WebP, GIF, etc.).
 */
async function toPngBuffer(buf: ArrayBuffer, mimeHint: string): Promise<ArrayBuffer> {
  const blob = new Blob([buf], { type: mimeHint });
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('OffscreenCanvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  return pngBlob.arrayBuffer();
}

export interface EmbedInput {
  buffers: ArrayBuffer[];
  mimes: string[];
}

/**
 * Embed all images into a single PDF, one image per page (sized to fit).
 * Returns the saved PDF bytes.
 */
export async function embedImagesToPdf(input: EmbedInput): Promise<Uint8Array> {
  const { PDFDocument } = await import('pdf-lib');
  const { buffers, mimes } = input;

  const doc = await PDFDocument.create();

  for (let i = 0; i < buffers.length; i++) {
    let buf = buffers[i]!;
    const mime = mimes[i] ?? '';

    let embeddedImage;

    if (isJpeg(buf)) {
      embeddedImage = await doc.embedJpg(buf);
    } else if (isPng(buf)) {
      embeddedImage = await doc.embedPng(buf);
    } else {
      // Convert to PNG via OffscreenCanvas for unsupported formats (WebP, etc.)
      buf = await toPngBuffer(buf, mime || 'image/*');
      embeddedImage = await doc.embedPng(buf);
    }

    const { width, height } = embeddedImage;
    const page = doc.addPage([width, height]);
    page.drawImage(embeddedImage, { x: 0, y: 0, width, height });
  }

  return doc.save();
}
