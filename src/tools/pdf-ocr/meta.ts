import type { ToolMeta } from '@/core/tool-types';

export const meta: ToolMeta = {
  id: 'pdf-ocr',
  slug: 'pdf-ocr',
  name: 'OCR',
  tagline: 'Extract text from scanned PDFs and images using Tesseract OCR',
  category: 'text',
  input: { accepts: ['pdf', 'image'], minFiles: 1, maxFiles: 10 },
  output: { kind: 'text', multiple: true },
  mode: 'local',
};
