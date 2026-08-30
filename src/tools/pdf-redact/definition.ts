import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfRedactOptions } from './options';
import { processPdfRedact } from './processor';
import { PdfRedactOptionsForm } from './options-form';

export const pdfRedactTool: ToolDefinition<PdfRedactOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfRedactOptionsForm,
  process: processPdfRedact,
};
