import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfSplitOptions } from './options';
import { PdfSplitOptionsForm } from './options-form';
import { processPdfSplit } from './processor';

export const pdfSplitTool: ToolDefinition<PdfSplitOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfSplitOptionsForm,
  process: processPdfSplit,
};
