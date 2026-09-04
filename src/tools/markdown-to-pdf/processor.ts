import { marked } from 'marked';
import { markdownTokensToBlocks } from '@/core/markdown-to-blocks';
import { renderRichBlocks } from '@/core/rich-text';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { MarkdownToPdfOptions } from './options';

export async function processMarkdownToPdf(
  ctx: ProcessingContext<MarkdownToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const text = await files[0]!.file.text();
  const base = files[0]!.name.replace(/\.(md|markdown|txt)$/i, '');

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.2);

  const tokens = marked.lexer(text);
  const blocks = markdownTokensToBlocks(tokens);

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.5);

  const bytes = await renderRichBlocks(blocks);

  onProgress(1);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
