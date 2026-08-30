import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface TextBlock {
  text: string;
  fontSize: number;
  bold?: boolean;
  mono?: boolean;
  indent?: number; // extra left padding in pts, default 0
  spaceBefore?: number; // pts before block, default 0
  spaceAfter?: number; // pts after block, default 4
  bullet?: string; // e.g. '•' — prepended before text
}

export interface TextToPdfConfig {
  pageWidth?: number; // default 595.28 (A4)
  pageHeight?: number; // default 841.89 (A4)
  marginX?: number; // default 56
  marginTop?: number; // default 56
  marginBottom?: number; // default 56
  defaultFontSize?: number; // default 11
  lineSpacing?: number; // multiplier, default 1.4
}

export async function renderBlocksToPdf(
  blocks: TextBlock[],
  config: TextToPdfConfig = {},
): Promise<Uint8Array> {
  const {
    pageWidth = 595.28,
    pageHeight = 841.89,
    marginX = 56,
    marginTop = 56,
    marginBottom = 56,
    lineSpacing = 1.4,
  } = config;

  const doc = await PDFDocument.create();
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const courier = await doc.embedFont(StandardFonts.Courier);

  const availWidth = pageWidth - marginX * 2;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - marginTop;

  const addPage = () => {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - marginTop;
  };

  const getFont = (block: TextBlock) => {
    if (block.mono) return courier;
    if (block.bold) return helveticaBold;
    return helvetica;
  };

  for (const block of blocks) {
    const font = getFont(block);
    const fs = block.fontSize;
    const lineH = fs * lineSpacing;
    const indent = block.indent ?? 0;
    const spaceB = block.spaceBefore ?? 0;
    const spaceA = block.spaceAfter ?? 4;

    y -= spaceB;

    // word-wrap the text
    const prefix = block.bullet ? `${block.bullet} ` : '';
    const fullText = prefix + block.text;
    const maxW = availWidth - indent;

    // split into lines
    const words = fullText.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, fs) <= maxW) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    if (lines.length === 0) lines.push('');

    for (const line of lines) {
      if (y - lineH < marginBottom) addPage();
      page.drawText(line, {
        x: marginX + indent,
        y: y - fs,
        size: fs,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineH;
    }

    y -= spaceA;
  }

  return doc.save();
}
