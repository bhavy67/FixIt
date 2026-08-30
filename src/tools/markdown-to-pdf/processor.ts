import { marked, type Token } from 'marked';
import { renderBlocksToPdf, type TextBlock } from '@/tools/pdf/lib/text-to-pdf';
import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { MarkdownToPdfOptions } from './options';

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^#+\s/, '');
}

function tokenToBlocks(token: Token): TextBlock[] {
  const blocks: TextBlock[] = [];

  if (token.type === 'heading') {
    const depth = token.depth;
    const fontSize = depth === 1 ? 22 : depth === 2 ? 18 : depth === 3 ? 14 : 12;
    const spaceBefore = depth === 1 ? 16 : depth === 2 ? 12 : 8;
    blocks.push({
      text: stripInlineMarkdown(token.text),
      fontSize,
      bold: true,
      spaceBefore,
      spaceAfter: 6,
    });
  } else if (token.type === 'paragraph') {
    blocks.push({
      text: stripInlineMarkdown(token.text),
      fontSize: 11,
      spaceBefore: 0,
      spaceAfter: 8,
    });
  } else if (token.type === 'list') {
    for (const item of token.items) {
      blocks.push({
        text: stripInlineMarkdown(item.text),
        fontSize: 11,
        bullet: '•',
        indent: 12,
        spaceAfter: 3,
      });
    }
  } else if (token.type === 'code') {
    blocks.push({
      text: token.text,
      fontSize: 9,
      mono: true,
      spaceBefore: 6,
      spaceAfter: 6,
      indent: 12,
    });
  } else if (token.type === 'blockquote') {
    blocks.push({
      text: stripInlineMarkdown(token.text),
      fontSize: 11,
      indent: 20,
      spaceBefore: 4,
      spaceAfter: 4,
    });
  } else if (token.type === 'space') {
    // skip
  } else if (token.type === 'hr') {
    blocks.push({
      text: '────────────────────────────────────────',
      fontSize: 9,
      spaceBefore: 8,
      spaceAfter: 8,
    });
  } else {
    // Default: try to get text from the token
    const anyToken = token as Record<string, unknown>;
    const text = typeof anyToken['text'] === 'string' ? anyToken['text'] : token.raw;
    if (text.trim()) {
      blocks.push({
        text: stripInlineMarkdown(text),
        fontSize: 11,
        spaceAfter: 8,
      });
    }
  }

  return blocks;
}

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
  const blocks: TextBlock[] = [];
  for (const token of tokens) {
    blocks.push(...tokenToBlocks(token));
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
