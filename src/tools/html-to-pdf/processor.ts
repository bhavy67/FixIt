import { renderBlocksToPdf, type TextBlock } from '@/tools/pdf/lib/text-to-pdf';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { HtmlToPdfOptions } from './options';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NAV', 'HEADER', 'FOOTER', 'HEAD']);

function walkNode(node: Element, blocks: TextBlock[]): void {
  const tag = node.tagName?.toUpperCase() ?? '';

  if (SKIP_TAGS.has(tag)) return;

  if (tag === 'H1') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 22, bold: true, spaceBefore: 16, spaceAfter: 6 });
    return;
  } else if (tag === 'H2') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 18, bold: true, spaceBefore: 12, spaceAfter: 6 });
    return;
  } else if (tag === 'H3') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 14, bold: true, spaceBefore: 8, spaceAfter: 4 });
    return;
  } else if (tag === 'H4' || tag === 'H5' || tag === 'H6') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 12, bold: true, spaceBefore: 6, spaceAfter: 4 });
    return;
  } else if (tag === 'P') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 11, spaceBefore: 0, spaceAfter: 8 });
    return;
  } else if (tag === 'LI') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 11, bullet: '•', indent: 12, spaceAfter: 3 });
    return;
  } else if (tag === 'PRE' || tag === 'CODE') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 9, mono: true, indent: 12, spaceAfter: 6 });
    return;
  } else if (tag === 'BLOCKQUOTE') {
    const text = node.textContent?.trim() ?? '';
    if (text) blocks.push({ text, fontSize: 11, indent: 20 });
    return;
  } else if (tag === 'HR') {
    blocks.push({ text: '', fontSize: 11, spaceBefore: 8, spaceAfter: 8 });
    return;
  }

  // Recurse into children for other elements
  for (const child of Array.from(node.children)) {
    walkNode(child, blocks);
  }
}

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

  const blocks: TextBlock[] = [];
  const body = doc.body;
  for (const child of Array.from(body.children)) {
    walkNode(child, blocks);
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.5);

  const bytes = await renderBlocksToPdf(blocks);

  onProgress(1);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
