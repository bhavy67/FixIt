import JSZip from 'jszip';
import { htmlBodyToBlocks } from '@/core/html-to-blocks';
import { renderRichBlocks, type Block } from '@/core/rich-text';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { EpubToPdfOptions } from './options';

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

  let contentFiles: string[] = [];

  const containerXmlFile = zip.file('META-INF/container.xml');
  if (containerXmlFile) {
    const containerText = await containerXmlFile.async('text');
    const opfMatch = containerText.match(/full-path="([^"]+\.opf)"/);
    if (opfMatch?.[1]) {
      const opfFile = zip.file(opfMatch[1]);
      if (opfFile) {
        const opfText = await opfFile.async('text');
        const spineMatches = [...opfText.matchAll(/idref="([^"]+)"/g)].map((m) => m[1]!);
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

  const blocks: Block[] = [];
  const parser = new DOMParser();

  for (let i = 0; i < contentFiles.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const fname = contentFiles[i]!;
    const fileObj = zip.file(fname);
    if (!fileObj) continue;

    const html = await fileObj.async('text');
    const doc = parser.parseFromString(html, 'text/html');
    for (const block of htmlBodyToBlocks(doc.body)) blocks.push(block);

    onProgress(0.2 + (i / contentFiles.length) * 0.5);
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.7);

  const bytes = await renderRichBlocks(blocks);

  onProgress(1);
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
