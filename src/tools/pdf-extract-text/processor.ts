import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfExtractTextOptions } from './options';

export async function processPdfExtractText(
  ctx: ProcessingContext<PdfExtractTextOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const base = files[0]!.name.replace(/\.pdf$/i, '');

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const buffer = await files[0]!.file.arrayBuffer();
  onProgress(0.1);

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const parts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items into lines by shared Y baseline; emit blank lines when
    // Y jumps more than a full line height (paragraph break heuristic).
    const lines: string[] = [];
    let currentY: number | null = null;
    let lastLineHeight = 10;
    let currentLine = '';

    for (const item of content.items) {
      if (!('str' in item)) continue;
      const typedItem = item as { str: string; transform: number[]; hasEOL?: boolean };
      const y = Math.round(typedItem.transform[5] ?? 0);
      const h = Math.abs(typedItem.transform[3] ?? 10) || 10;

      if (currentY !== null && y !== currentY) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = '';
        // If we skipped more than 1.5× the previous line height, insert a
        // blank line to preserve paragraph structure.
        if (Math.abs(currentY - y) > lastLineHeight * 1.5) lines.push('');
      }
      currentY = y;
      lastLineHeight = h;
      currentLine += typedItem.str;
      if (typedItem.hasEOL) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = '';
        currentY = null;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const pageText = lines.join('\n').trim();
    if (pageText) parts.push(`=== Page ${i} ===\n${pageText}`);
    onProgress(0.1 + (i / pdf.numPages) * 0.9);
  }

  const text = parts.join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });
  return { outputs: [{ blob, filename: `${base}-text.txt`, bytes: blob.size }] };
}
