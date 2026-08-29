import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import { computeDestRect } from './fit-math';
import { FORMAT_EXT, type ImageResizeOptions } from './options';

async function resizeOne(file: File, opts: ImageResizeOptions): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = new OffscreenCanvas(opts.width, opts.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');

    // JPEG has no alpha channel; fill white so `contain` letterboxing isn't black.
    if (opts.format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, opts.width, opts.height);
    }

    const rect = computeDestRect(bitmap.width, bitmap.height, opts.width, opts.height, opts.fit);
    ctx.drawImage(bitmap, rect.x, rect.y, rect.w, rect.h);

    const blob = await canvas.convertToBlob({
      type: opts.format,
      quality: opts.format === 'image/png' ? undefined : opts.quality,
    });
    return blob;
  } finally {
    bitmap.close();
  }
}

function outFilename(originalName: string, opts: ImageResizeOptions): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'image';
  const ext = FORMAT_EXT[opts.format];
  return `${base}-${opts.width}x${opts.height}.${ext}`;
}

export async function processImageResize(
  ctx: ProcessingContext<ImageResizeOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;
  const outputs: ProcessingResultBlob[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    onProgress(i / files.length);
    const f = files[i]!;
    const blob = await resizeOne(f.file, options);
    outputs.push({
      blob,
      filename: outFilename(f.name, options),
      bytes: blob.size,
    });
  }

  return { outputs, meta: { count: files.length } };
}
