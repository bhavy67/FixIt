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
    const pageText = content.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ')
      .trim();
    if (pageText) parts.push(`=== Page ${i} ===\n${pageText}`);
    onProgress(0.1 + (i / pdf.numPages) * 0.9);
  }

  const text = parts.join('\n\n');
  const blob = new Blob([text], { type: 'text/plain' });

  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  }

  return { outputs: [{ blob, filename: `${base}-transcript.txt`, bytes: blob.size }] };
}
