import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type PdfSignOptions } from './options';
import { processPdfSign } from './processor';
import { PdfSignOptionsForm } from './options-form';
import { PdfSignPreviewPanel } from './pdf-preview-panel';

export const pdfSignTool: ToolDefinition<PdfSignOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: PdfSignOptionsForm,
  RightPanel: PdfSignPreviewPanel,
  process: processPdfSign,
};
