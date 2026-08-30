import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type TxtToPdfOptions } from './options';
import { TxtToPdfOptionsForm } from './options-form';
import { processTxtToPdf } from './processor';

export const txtToPdfTool: ToolDefinition<TxtToPdfOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: TxtToPdfOptionsForm,
  process: processTxtToPdf,
};
