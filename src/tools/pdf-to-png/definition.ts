import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfToPngOptions } from './options';
import { PdfToPngOptionsForm } from './options-form';
import { processPdfToPng } from './processor';

export const pdfToPngTool: ToolDefinition<PdfToPngOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfToPngOptionsForm,
  process: processPdfToPng,
};
