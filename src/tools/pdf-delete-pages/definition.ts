import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfDeleteOptions } from './options';
import { PdfDeleteOptionsForm } from './options-form';
import { processPdfDelete } from './processor';

export const pdfDeletePagesTool: ToolDefinition<PdfDeleteOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfDeleteOptionsForm,
  process: processPdfDelete,
};
