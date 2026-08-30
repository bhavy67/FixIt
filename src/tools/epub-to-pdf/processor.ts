import JSZip from 'jszip';
import { renderBlocksToPdf, type TextBlock } from '@/tools/pdf/lib/text-to-pdf';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { EpubToPdfOptions } from './options';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NAV', 'HEAD']);

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

export async function processEpubToPdf(
  ctx: ProcessingContext<EpubToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.(epub|zip)$/i, '');

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.1);

  const zip = await JSZip.loadAsync(buffer);

  // Find HTML/XHTML content files from spine order
  let contentFiles: string[] = [];

  const containerXmlFile = zip.file('META-INF/container.xml');
  if (containerXmlFile) {
    const containerText = await containerXmlFile.async('text');
    const opfMatch = containerText.match(/full-path="([^"]+\.opf)"/);
    if (opfMatch?.[1]) {
      const opfFile = zip.file(opfMatch[1]);
      if (opfFile) {
        const opfText = await opfFile.async('text');
        // Parse spine idrefs
        const spineMatches = [...opfText.matchAll(/idref="([^"]+)"/g)].map((m) => m[1]!);
        // Parse manifest items
        const manifestItems: Record<string, string> = {};
        for (const m of opfText.matchAll(/id="([^"]+)"[^>]+href="([^"]+)"/g)) {
          manifestItems[m[1]!] = m[2]!;
        }
        const opfDir = opfMatch[1].includes('/')
          ? opfMatch[1].slice(0, opfMatch[1].lastIndexOf('/') + 1)
          : '';
        contentFiles = spineMatches
          .map((id) => manifestItems[id])
          .filter((href): href is string => Boolean(href))
          .map((href) => `${opfDir}${href}`);
      }
    }
  }

  // Fallback: all html/xhtml files sorted (excluding toc/nav)
  if (contentFiles.length === 0) {
    contentFiles = Object.keys(zip.files)
      .filter(
        (name) =>
          /\.(html|xhtml|htm)$/i.test(name) &&
          !name.toLowerCase().includes('toc') &&
          !name.toLowerCase().includes('nav'),
      )
      .sort();
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.2);

  // Parse each content file into TextBlocks
  const blocks: TextBlock[] = [];
  const parser = new DOMParser();

  for (let i = 0; i < contentFiles.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const fname = contentFiles[i]!;
    const fileObj = zip.file(fname);
    if (!fileObj) continue;

    const html = await fileObj.async('text');
    const doc = parser.parseFromString(html, 'text/html');

    for (const child of Array.from(doc.body.children)) {
      walkNode(child, blocks);
    }

    onProgress(0.2 + (i / contentFiles.length) * 0.5);
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.7);

  const bytes = await renderBlocksToPdf(blocks);

  onProgress(1);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
