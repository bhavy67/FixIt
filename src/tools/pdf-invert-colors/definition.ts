import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfInvertColorsOptions } from './options';
import { PdfInvertColorsOptionsForm } from './options-form';
import { processPdfInvertColors } from './processor';

export const pdfInvertColorsTool: ToolDefinition<PdfInvertColorsOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfInvertColorsOptionsForm,
  process: processPdfInvertColors,
};
