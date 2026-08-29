import type { ToolDefinition } from '@/core/tool-types';
import { meta } from './meta';
import { DEFAULT_OPTIONS, type ImageResizeOptions } from './options';
import { processImageResize } from './processor';
import { ImageResizeOptionsForm } from './options-form';

export const imageResizeTool: ToolDefinition<ImageResizeOptions> = {
  ...meta,
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: ImageResizeOptionsForm,
  process: processImageResize,
};
