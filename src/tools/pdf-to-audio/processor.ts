import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfToAudioOptions } from './options';

export async function processPdfToAudio(
  ctx: ProcessingContext<PdfToAudioOptions>,
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

    // Preserve line breaks by grouping items with the same Y transform.
    const lines: string[] = [];
    let currentY: number | null = null;
    let currentLine = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      const typedItem = item as { str: string; transform: number[]; hasEOL?: boolean };
      const y = Math.round(typedItem.transform[5] ?? 0);
      if (currentY !== null && y !== currentY) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = '';
      }
      currentY = y;
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
  if (!text) {
    throw new Error('No readable text found in this PDF (it may be a scanned image).');
  }
  const blob = new Blob([text], { type: 'text/plain' });

  return { outputs: [{ blob, filename: `${base}-transcript.txt`, bytes: blob.size }] };
}
