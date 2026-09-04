/**
 * Walks an HTML/XHTML DOM and produces rich-text `Block`s. Used by html-to-pdf
 * and epub-to-pdf; both were dropping inline formatting because they read
 * `textContent` on every element.
 */

import type { Block, TextRun } from './rich-text';

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NAV',
  'HEADER',
  'FOOTER',
  'HEAD',
  'IFRAME',
  'NOSCRIPT',
]);

const LINK_COLOR: readonly [number, number, number] = [0.13, 0.4, 0.72];

interface RunStyle {
  bold?: boolean;
  italic?: boolean;
  mono?: boolean;
  color?: readonly [number, number, number];
}

function extendStyle(style: RunStyle, extra: RunStyle): RunStyle {
  return { ...style, ...extra };
}

function collectInlineRuns(node: Node, style: RunStyle, out: TextRun[]): void {
  if (node.nodeType === 3 /* TEXT_NODE */) {
    const text = (node.textContent ?? '').replace(/\s+/g, ' ');
    if (text) out.push({ text, ...style });
    return;
  }
  if (node.nodeType !== 1) return;
  const el = node as Element;
  const tag = el.tagName?.toUpperCase() ?? '';
  if (SKIP_TAGS.has(tag)) return;

  let nextStyle = style;
  switch (tag) {
    case 'STRONG':
    case 'B':
      nextStyle = extendStyle(style, { bold: true });
      break;
    case 'EM':
    case 'I':
      nextStyle = extendStyle(style, { italic: true });
      break;
    case 'CODE':
      nextStyle = extendStyle(style, { mono: true });
      break;
    case 'A':
      nextStyle = extendStyle(style, { color: LINK_COLOR });
      break;
    case 'BR':
      out.push({ text: ' ', ...style }); // keep some space marker
      return;
  }

  for (const child of Array.from(el.childNodes)) {
    collectInlineRuns(child, nextStyle, out);
  }
}

function elementToRuns(el: Element): TextRun[] {
  const runs: TextRun[] = [];
  collectInlineRuns(el, {}, runs);
  // Trim leading/trailing whitespace-only runs.
  while (runs.length && !runs[0]!.text.trim()) runs.shift();
  while (runs.length && !runs[runs.length - 1]!.text.trim()) runs.pop();
  return runs;
}

function walkList(list: Element, depth: number, out: Block[]): void {
  const ordered = list.tagName.toUpperCase() === 'OL';
  const startAttr = list.getAttribute('start');
  let n = startAttr ? Number(startAttr) : 1;
  for (const child of Array.from(list.children)) {
    if (child.tagName.toUpperCase() !== 'LI') continue;
    const marker = ordered ? `${n}.` : '•';
    n++;

    // Split each LI into its own inline content (not counting nested UL/OL/tables/pre).
    const inlineNodes: Node[] = [];
    const blockChildren: Element[] = [];
    for (const c of Array.from(child.childNodes)) {
      if (c.nodeType !== 1) {
        inlineNodes.push(c);
        continue;
      }
      const t = (c as Element).tagName.toUpperCase();
      if (t === 'UL' || t === 'OL' || t === 'TABLE' || t === 'PRE') {
        blockChildren.push(c as Element);
      } else {
        inlineNodes.push(c);
      }
    }

    const runs: TextRun[] = [];
    for (const n of inlineNodes) collectInlineRuns(n, {}, runs);
    while (runs.length && !runs[0]!.text.trim()) runs.shift();
    while (runs.length && !runs[runs.length - 1]!.text.trim()) runs.pop();

    out.push({
      kind: 'list-item',
      runs,
      depth,
      marker,
      spaceAfter: 3,
    });

    for (const bc of blockChildren) {
      if (bc.tagName.toUpperCase() === 'UL' || bc.tagName.toUpperCase() === 'OL') {
        walkList(bc, depth + 1, out);
      } else {
        walkBlockNode(bc, out);
      }
    }
  }
}

function walkTable(table: Element, out: Block[]): void {
  const header: string[] = [];
  const rows: string[][] = [];
  let sawTHead = false;

  for (const section of Array.from(table.children)) {
    const stag = section.tagName.toUpperCase();
    if (stag === 'THEAD') {
      sawTHead = true;
      for (const tr of Array.from(section.children)) {
        if (tr.tagName.toUpperCase() !== 'TR') continue;
        for (const cell of Array.from(tr.children)) {
          header.push((cell.textContent ?? '').trim());
        }
      }
    } else if (stag === 'TBODY' || stag === 'TFOOT') {
      for (const tr of Array.from(section.children)) {
        if (tr.tagName.toUpperCase() !== 'TR') continue;
        const row: string[] = [];
        for (const cell of Array.from(tr.children)) {
          row.push((cell.textContent ?? '').trim());
        }
        rows.push(row);
      }
    } else if (stag === 'TR') {
      const row: string[] = [];
      let allTh = true;
      for (const cell of Array.from(section.children)) {
        row.push((cell.textContent ?? '').trim());
        if (cell.tagName.toUpperCase() !== 'TH') allTh = false;
      }
      if (allTh && !sawTHead) {
        for (const c of row) header.push(c);
        sawTHead = true;
      } else {
        rows.push(row);
      }
    }
  }

  out.push({
    kind: 'table',
    header: header.length > 0 ? header : undefined,
    rows,
    fontSize: 9,
    spaceBefore: 6,
    spaceAfter: 8,
  });
}

function walkBlockNode(node: Element, out: Block[]): void {
  const tag = node.tagName?.toUpperCase() ?? '';
  if (SKIP_TAGS.has(tag)) return;

  switch (tag) {
    case 'H1':
    case 'H2':
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6': {
      const level = Number(tag[1]!) as 1 | 2 | 3 | 4 | 5 | 6;
      const runs = elementToRuns(node);
      if (runs.length) {
        out.push({
          kind: 'heading',
          runs,
          level,
          spaceBefore: level === 1 ? 16 : level === 2 ? 12 : 8,
          spaceAfter: 6,
        });
      }
      return;
    }
    case 'P': {
      const runs = elementToRuns(node);
      if (runs.length) {
        out.push({ kind: 'paragraph', runs, spaceAfter: 8 });
      }
      return;
    }
    case 'UL':
    case 'OL':
      walkList(node, 0, out);
      return;
    case 'PRE': {
      const codeEl = node.querySelector('code');
      const text = (codeEl ?? node).textContent ?? '';
      if (text.trim()) {
        out.push({ kind: 'code', text: text.replace(/\n+$/, ''), spaceBefore: 6, spaceAfter: 8 });
      }
      return;
    }
    case 'BLOCKQUOTE': {
      const runs = elementToRuns(node);
      if (runs.length) {
        out.push({ kind: 'blockquote', runs, spaceBefore: 4, spaceAfter: 6 });
      }
      return;
    }
    case 'HR':
      out.push({ kind: 'hr', spaceBefore: 8, spaceAfter: 8 });
      return;
    case 'TABLE':
      walkTable(node, out);
      return;
    case 'DIV':
    case 'SECTION':
    case 'ARTICLE':
    case 'MAIN':
    case 'BODY':
      for (const child of Array.from(node.children)) walkBlockNode(child, out);
      return;
    default: {
      // Unknown block-level container: treat as paragraph if it has text.
      const runs = elementToRuns(node);
      if (runs.length) out.push({ kind: 'paragraph', runs, spaceAfter: 6 });
    }
  }
}

export function htmlBodyToBlocks(body: Element): Block[] {
  const out: Block[] = [];
  for (const child of Array.from(body.children)) walkBlockNode(child, out);
  return out;
}
