import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { renderPdfPages } from '@/tools/pdf/lib/render-pdf-pages';
import type { PdfToJpgOptions } from './options';

export async function processPdfToJpg(
  ctx: ProcessingContext<PdfToJpgOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  const buffer = await files[0]!.file.arrayBuffer();
  const basename = files[0]!.name.replace(/\.pdf$/i, '');

  const outputs = await renderPdfPages(
    buffer,
    { format: 'image/jpeg', quality: options.quality, scale: options.scale, basename },
    onProgress,
    signal,
  );

  return { outputs };
}
