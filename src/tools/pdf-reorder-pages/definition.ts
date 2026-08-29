import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfReorderOptions } from './options';
import { PdfReorderOptionsForm } from './options-form';
import { processPdfReorder } from './processor';

export const pdfReorderPagesTool: ToolDefinition<PdfReorderOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfReorderOptionsForm,
  process: processPdfReorder,
};
