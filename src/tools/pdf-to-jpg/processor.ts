import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { bundleAsZip } from '@/core/zip-outputs';
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
    (p) => onProgress(options.bundle ? p * 0.9 : p),
    signal,
  );

  if (options.bundle && outputs.length > 0) {
    onProgress(0.92);
    const zip = await bundleAsZip(outputs, `${basename}-pages.zip`);
    onProgress(1);
    return { outputs: [zip] };
  }

  return { outputs };
}
