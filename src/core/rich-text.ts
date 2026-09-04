/**
 * A run-based text/block model shared by markdown-to-pdf, html-to-pdf, and
 * epub-to-pdf. Inline runs preserve bold/italic/mono/link colouring across
 * word-wrap; blocks handle headings, lists (with nesting), code blocks,
 * blockquotes, tables, and horizontal rules.
 */

import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from 'pdf-lib';

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  mono?: boolean;
  /** rgb components 0..1 — used for link colouring. */
  color?: readonly [number, number, number];
}

interface CommonBlock {
  spaceBefore?: number;
  spaceAfter?: number;
}

export interface ParagraphBlock extends CommonBlock {
  kind: 'paragraph';
  runs: TextRun[];
  fontSize?: number;
  indent?: number;
}

export interface HeadingBlock extends CommonBlock {
  kind: 'heading';
  runs: TextRun[];
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ListItemBlock extends CommonBlock {
  kind: 'list-item';
  runs: TextRun[];
  depth: number;
  marker: string;
  fontSize?: number;
}

export interface CodeBlock extends CommonBlock {
  kind: 'code';
  text: string;
  fontSize?: number;
}

export interface BlockquoteBlock extends CommonBlock {
  kind: 'blockquote';
  runs: TextRun[];
  fontSize?: number;
}

export interface HrBlock extends CommonBlock {
  kind: 'hr';
}

export interface TableBlock extends CommonBlock {
  kind: 'table';
  header?: string[];
  rows: string[][];
  fontSize?: number;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListItemBlock
  | CodeBlock
  | BlockquoteBlock
  | HrBlock
  | TableBlock;

export interface RichTextConfig {
  pageWidth?: number;
  pageHeight?: number;
  marginX?: number;
  marginTop?: number;
  marginBottom?: number;
  defaultFontSize?: number;
  lineSpacing?: number;
}

const HEADING_SIZES: Record<HeadingBlock['level'], number> = {
  1: 22,
  2: 18,
  3: 15,
  4: 13,
  5: 12,
  6: 11,
};

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
  mono: PDFFont;
  monoBold: PDFFont;
  monoItalic: PDFFont;
}

function pickFont(fonts: FontSet, run: TextRun): PDFFont {
  if (run.mono) {
    if (run.bold) return fonts.monoBold;
    if (run.italic) return fonts.monoItalic;
    return fonts.mono;
  }
  if (run.bold && run.italic) return fonts.boldItalic;
  if (run.bold) return fonts.bold;
  if (run.italic) return fonts.italic;
  return fonts.regular;
}

/**
 * A single positioned atom on a line — a word or contiguous non-whitespace
 * chunk, plus a trailing space width if applicable.
 */
interface Atom {
  run: TextRun;
  text: string;
  width: number;
  spaceAfter: number;
}

function tokenizeRuns(runs: TextRun[], fonts: FontSet, fontSize: number): Atom[] {
  const atoms: Atom[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const font = pickFont(fonts, run);
    // Split preserving whitespace so we can carry space widths across runs.
    const parts = run.text.split(/(\s+)/);
    let pendingSpace = 0;
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        pendingSpace += font.widthOfTextAtSize(part.replace(/\s+/g, ' '), fontSize);
      } else {
        atoms.push({
          run,
          text: part,
          width: font.widthOfTextAtSize(part, fontSize),
          spaceAfter: 0,
        });
        if (atoms.length > 1) {
          atoms[atoms.length - 2]!.spaceAfter += pendingSpace;
        } else {
          // leading spaces — ignore
        }
        pendingSpace = 0;
      }
    }
    if (pendingSpace > 0 && atoms.length > 0) {
      atoms[atoms.length - 1]!.spaceAfter += pendingSpace;
    }
  }
  return atoms;
}

function layoutAtoms(atoms: Atom[], maxWidth: number, fonts: FontSet, fontSize: number): Atom[][] {
  const lines: Atom[][] = [];
  let cur: Atom[] = [];
  let curW = 0;
  for (const atom of atoms) {
    const w = atom.width;
    if (cur.length === 0) {
      cur.push(atom);
      curW = w;
      continue;
    }
    const prev = cur[cur.length - 1]!;
    const withSpace = curW + prev.spaceAfter + w;
    if (withSpace <= maxWidth) {
      cur.push(atom);
      curW = withSpace;
    } else {
      lines.push(cur);
      cur = [atom];
      curW = w;
    }
  }
  if (cur.length > 0) lines.push(cur);

  // Break any single-atom line whose width exceeds maxWidth (very long words).
  const final: Atom[][] = [];
  for (const line of lines) {
    if (line.length === 1 && line[0]!.width > maxWidth) {
      const atom = line[0]!;
      const font = pickFont(fonts, atom.run);
      // Character-level break.
      let chunk = '';
      let chunkW = 0;
      for (const ch of atom.text) {
        const cw = font.widthOfTextAtSize(ch, fontSize);
        if (chunkW + cw > maxWidth && chunk) {
          final.push([
            { run: atom.run, text: chunk, width: chunkW, spaceAfter: 0 },
          ]);
          chunk = ch;
          chunkW = cw;
        } else {
          chunk += ch;
          chunkW += cw;
        }
      }
      if (chunk) {
        final.push([{ run: atom.run, text: chunk, width: chunkW, spaceAfter: atom.spaceAfter }]);
      }
    } else {
      final.push(line);
    }
  }
  return final;
}

export async function renderRichBlocks(
  blocks: Block[],
  config: RichTextConfig = {},
): Promise<Uint8Array> {
  const {
    pageWidth = 595.28,
    pageHeight = 841.89,
    marginX = 56,
    marginTop = 56,
    marginBottom = 56,
    defaultFontSize = 11,
    lineSpacing = 1.4,
  } = config;

  const doc = await PDFDocument.create();
  const fonts: FontSet = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await doc.embedFont(StandardFonts.Courier),
    monoBold: await doc.embedFont(StandardFonts.CourierBold),
    monoItalic: await doc.embedFont(StandardFonts.CourierOblique),
  };

  const availWidth = pageWidth - marginX * 2;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const addPage = (): void => {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - marginTop;
  };

  const ensureRoom = (needed: number): void => {
    if (y - needed < marginBottom) addPage();
  };

  const drawInlineLines = (
    runsOrText: TextRun[],
    fontSize: number,
    indent: number,
  ): void => {
    const atoms = tokenizeRuns(runsOrText, fonts, fontSize);
    if (atoms.length === 0) return;
    const maxW = availWidth - indent;
    const lines = layoutAtoms(atoms, maxW, fonts, fontSize);
    const lineH = fontSize * lineSpacing;
    for (const line of lines) {
      ensureRoom(lineH);
      let x = marginX + indent;
      for (let i = 0; i < line.length; i++) {
        const atom = line[i]!;
        const font = pickFont(fonts, atom.run);
        const color: RGB = atom.run.color
          ? rgb(atom.run.color[0], atom.run.color[1], atom.run.color[2])
          : rgb(0, 0, 0);
        page.drawText(atom.text, {
          x,
          y: y - fontSize,
          size: fontSize,
          font,
          color,
        });
        x += atom.width;
        if (i < line.length - 1) x += atom.spaceAfter;
      }
      y -= lineH;
    }
  };

  const drawCode = (text: string, fontSize: number): void => {
    const lineH = fontSize * lineSpacing;
    const lines = text.split('\n');
    for (const raw of lines) {
      // Wrap each raw line by character since code lines can be arbitrarily long.
      const font = fonts.mono;
      const maxW = availWidth - 24;
      let chunk = '';
      let chunkW = 0;
      const parts: string[] = [];
      for (const ch of raw) {
        const cw = font.widthOfTextAtSize(ch, fontSize);
        if (chunkW + cw > maxW && chunk) {
          parts.push(chunk);
          chunk = ch;
          chunkW = cw;
        } else {
          chunk += ch;
          chunkW += cw;
        }
      }
      parts.push(chunk);
      for (const part of parts) {
        ensureRoom(lineH);
        page.drawText(part, {
          x: marginX + 12,
          y: y - fontSize,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= lineH;
      }
    }
  };

  const drawTable = (block: TableBlock): void => {
    const fs = block.fontSize ?? 9;
    const padding = 4;
    const lineH = fs * 1.3;
    const columns = Math.max(
      block.header?.length ?? 0,
      ...block.rows.map((r) => r.length),
    );
    if (columns === 0) return;
    const colW = availWidth / columns;
    const rows: string[][] = [];
    if (block.header) rows.push(block.header);
    rows.push(...block.rows);

    const cellHeightFor = (row: string[]): number => {
      let maxLines = 1;
      for (const cell of row) {
        const wrapped = wrapMonoOrSans(cell, fonts.regular, fs, colW - padding * 2);
        if (wrapped.length > maxLines) maxLines = wrapped.length;
      }
      return maxLines * lineH + padding * 2;
    };

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri]!;
      const h = cellHeightFor(row);
      ensureRoom(h);
      const isHeader = block.header && ri === 0;
      if (isHeader) {
        page.drawRectangle({
          x: marginX,
          y: y - h,
          width: availWidth,
          height: h,
          color: rgb(0.9, 0.9, 0.9),
        });
      }
      for (let ci = 0; ci < columns; ci++) {
        const cellX = marginX + ci * colW;
        page.drawRectangle({
          x: cellX,
          y: y - h,
          width: colW,
          height: h,
          borderColor: rgb(0.7, 0.7, 0.7),
          borderWidth: 0.5,
        });
        const cellText = row[ci] ?? '';
        const wrapped = wrapMonoOrSans(cellText, fonts.regular, fs, colW - padding * 2);
        let ty = y - padding - fs;
        for (const line of wrapped) {
          page.drawText(line, {
            x: cellX + padding,
            y: ty,
            size: fs,
            font: isHeader ? fonts.bold : fonts.regular,
            color: rgb(0, 0, 0),
          });
          ty -= lineH;
        }
      }
      y -= h;
    }
  };

  const drawHr = (): void => {
    const gap = 6;
    ensureRoom(gap);
    y -= 3;
    page.drawLine({
      start: { x: marginX, y },
      end: { x: marginX + availWidth, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    });
    y -= 3;
  };

  for (const block of blocks) {
    y -= block.spaceBefore ?? 0;

    switch (block.kind) {
      case 'paragraph': {
        const fs = block.fontSize ?? defaultFontSize;
        drawInlineLines(block.runs, fs, block.indent ?? 0);
        break;
      }
      case 'heading': {
        drawInlineLines(
          block.runs.map((r) => ({ ...r, bold: true })),
          HEADING_SIZES[block.level],
          0,
        );
        break;
      }
      case 'list-item': {
        const fs = block.fontSize ?? defaultFontSize;
        const indent = 12 + block.depth * 18;
        const font = fonts.regular;
        const markerW = font.widthOfTextAtSize(block.marker + ' ', fs);
        // Draw marker on its own, then indent inline content.
        ensureRoom(fs * lineSpacing);
        page.drawText(block.marker, {
          x: marginX + indent - markerW,
          y: y - fs,
          size: fs,
          font,
          color: rgb(0, 0, 0),
        });
        drawInlineLines(block.runs, fs, indent);
        break;
      }
      case 'code': {
        drawCode(block.text, block.fontSize ?? 9);
        break;
      }
      case 'blockquote': {
        const fs = block.fontSize ?? defaultFontSize;
        const startY = y;
        drawInlineLines(block.runs, fs, 20);
        const endY = y;
        page.drawLine({
          start: { x: marginX + 6, y: startY - 2 },
          end: { x: marginX + 6, y: endY + fs * 0.2 },
          thickness: 2,
          color: rgb(0.7, 0.7, 0.7),
        });
        break;
      }
      case 'hr': {
        drawHr();
        break;
      }
      case 'table': {
        drawTable(block);
        break;
      }
    }

    y -= block.spaceAfter ?? 6;
  }

  return doc.save();
}

function wrapMonoOrSans(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  if (!text) return [''];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      // If word itself is too long, break it by character.
      if (font.widthOfTextAtSize(w, size) > maxWidth) {
        let chunk = '';
        for (const ch of w) {
          if (font.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else {
            chunk += ch;
          }
        }
        cur = chunk;
      } else {
        cur = w;
      }
    }
  }
  if (cur) lines.push(cur);
  if (lines.length === 0) lines.push('');
  return lines;
}

// Re-export just for callers that want to draw an image at the same margins.
export function getUsableWidth(config: RichTextConfig = {}): number {
  const { pageWidth = 595.28, marginX = 56 } = config;
  return pageWidth - marginX * 2;
}

// Suppress unused-warning for PDFPage import if tree-shaking clips it.
export type _PDFPage = PDFPage;
