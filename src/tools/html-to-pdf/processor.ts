import { htmlBodyToBlocks } from '@/core/html-to-blocks';
import { renderRichBlocks } from '@/core/rich-text';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { HtmlToPdfOptions } from './options';

export async function processHtmlToPdf(
  ctx: ProcessingContext<HtmlToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const html = await files[0]!.file.text();
  const base = files[0]!.name.replace(/\.(html|htm)$/i, '');

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.2);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks = htmlBodyToBlocks(doc.body);

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.5);

  const bytes = await renderRichBlocks(blocks);

  onProgress(1);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
