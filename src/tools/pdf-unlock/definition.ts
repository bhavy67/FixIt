import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfUnlockOptions } from './options';
import { PdfUnlockOptionsForm } from './options-form';
import { processPdfUnlock } from './processor';

export const pdfUnlockTool: ToolDefinition<PdfUnlockOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfUnlockOptionsForm,
  process: processPdfUnlock,
};
