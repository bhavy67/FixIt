/**
 * Converts marked's token tree into rich-text `Block`s. Preserves inline
 * bold/italic/code/links across word wraps and supports nested lists + tables.
 */

import type { Token, Tokens } from 'marked';
import type { Block, TextRun } from './rich-text';

const LINK_COLOR: readonly [number, number, number] = [0.13, 0.4, 0.72];

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  mono?: boolean;
  color?: readonly [number, number, number];
}

function inlineToRuns(tokens: Token[] | undefined, style: RunStyle, out: TextRun[]): void {
  if (!tokens) return;
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const t = token as Tokens.Text;
        if (t.tokens) inlineToRuns(t.tokens, style, out);
        else if (t.text) out.push({ text: t.text, ...style });
        break;
      }
      case 'strong': {
        inlineToRuns((token as Tokens.Strong).tokens, { ...style, bold: true }, out);
        break;
      }
      case 'em': {
        inlineToRuns((token as Tokens.Em).tokens, { ...style, italic: true }, out);
        break;
      }
      case 'codespan': {
        out.push({ text: (token as Tokens.Codespan).text, ...style, mono: true });
        break;
      }
      case 'link': {
        const link = token as Tokens.Link;
        inlineToRuns(link.tokens, { ...style, color: LINK_COLOR }, out);
        break;
      }
      case 'del': {
        inlineToRuns((token as Tokens.Del).tokens, style, out);
        break;
      }
      case 'br': {
        out.push({ text: ' ', ...style });
        break;
      }
      case 'html': {
        out.push({ text: (token as Tokens.HTML).text, ...style });
        break;
      }
      case 'escape': {
        out.push({ text: (token as Tokens.Escape).text, ...style });
        break;
      }
      default: {
        // Fallback: use raw text if present.
        const t = token as { text?: string; raw?: string };
        const s = typeof t.text === 'string' ? t.text : (t.raw ?? '');
        if (s) out.push({ text: s, ...style });
      }
    }
  }
}

function tokenToRuns(tokens: Token[]): TextRun[] {
  const runs: TextRun[] = [];
  inlineToRuns(tokens, {}, runs);
  return runs;
}

function pushListItems(list: Tokens.List, depth: number, out: Block[]): void {
  let ordinal = list.start === '' ? 1 : Number(list.start ?? 1);
  for (const item of list.items) {
    const marker = list.ordered ? `${ordinal}.` : '•';
    if (list.ordered) ordinal += 1;

    // Split item's tokens into inline text and nested block-lists.
    const inlineTokens: Token[] = [];
    const nested: Tokens.List[] = [];
    for (const t of item.tokens) {
      if (t.type === 'list') nested.push(t as Tokens.List);
      else inlineTokens.push(t);
    }

    // Flatten the inline tokens into a single run stream.
    const runs: TextRun[] = [];
    for (const t of inlineTokens) {
      if (t.type === 'text' || t.type === 'paragraph') {
        const inner = (t as { tokens?: Token[] }).tokens;
        if (inner) inlineToRuns(inner, {}, runs);
        else runs.push({ text: (t as { text: string }).text });
      } else if (t.type === 'code') {
        // Inline code block inside a list item — render as separate code block.
      } else {
        const inner = (t as { tokens?: Token[] }).tokens;
        if (inner) inlineToRuns(inner, {}, runs);
      }
    }

    out.push({
      kind: 'list-item',
      runs,
      depth,
      marker,
      spaceAfter: 3,
    });

    for (const nl of nested) pushListItems(nl, depth + 1, out);
  }
}

export function markdownTokensToBlocks(tokens: Token[]): Block[] {
  const out: Block[] = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const h = token as Tokens.Heading;
        const runs = tokenToRuns(h.tokens);
        if (runs.length) {
          out.push({
            kind: 'heading',
            runs,
            level: h.depth as 1 | 2 | 3 | 4 | 5 | 6,
            spaceBefore: h.depth === 1 ? 16 : h.depth === 2 ? 12 : 8,
            spaceAfter: 6,
          });
        }
        break;
      }
      case 'paragraph': {
        const p = token as Tokens.Paragraph;
        const runs = tokenToRuns(p.tokens);
        if (runs.length) out.push({ kind: 'paragraph', runs, spaceAfter: 8 });
        break;
      }
      case 'list': {
        pushListItems(token as Tokens.List, 0, out);
        break;
      }
      case 'code': {
        out.push({
          kind: 'code',
          text: (token as Tokens.Code).text,
          spaceBefore: 6,
          spaceAfter: 8,
        });
        break;
      }
      case 'blockquote': {
        const bq = token as Tokens.Blockquote;
        const runs: TextRun[] = [];
        for (const t of bq.tokens) {
          const inner = (t as { tokens?: Token[] }).tokens;
          if (inner) inlineToRuns(inner, {}, runs);
          else if ('text' in t && typeof t.text === 'string') runs.push({ text: t.text });
        }
        if (runs.length) out.push({ kind: 'blockquote', runs, spaceBefore: 4, spaceAfter: 6 });
        break;
      }
      case 'hr':
        out.push({ kind: 'hr', spaceBefore: 8, spaceAfter: 8 });
        break;
      case 'table': {
        const t = token as Tokens.Table;
        const header = t.header.map((c) => c.text.trim());
        const rows = t.rows.map((r) => r.map((c) => c.text.trim()));
        out.push({ kind: 'table', header, rows, fontSize: 9, spaceBefore: 6, spaceAfter: 8 });
        break;
      }
      case 'space':
        break;
      case 'html': {
        const raw = (token as Tokens.HTML).text.trim();
        if (raw) out.push({ kind: 'paragraph', runs: [{ text: raw }], spaceAfter: 6 });
        break;
      }
      default: {
        const anyToken = token as { text?: string; raw?: string };
        const text =
          typeof anyToken.text === 'string' ? anyToken.text : (anyToken.raw ?? '').trim();
        if (text) out.push({ kind: 'paragraph', runs: [{ text }], spaceAfter: 6 });
      }
    }
  }
  return out;
}
