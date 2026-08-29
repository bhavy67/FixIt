import type { ToolDefinition } from '@/core/tool-types';
import { DEFAULT_OPTIONS, type ImageResizeOptions } from './options';
import { processImageResize } from './processor';
import { ImageResizeOptionsForm } from './options-form';

export const imageResizeTool: ToolDefinition<ImageResizeOptions> = {
  id: 'image-resize',
  slug: 'resize-image',
  name: 'Image Resize',
  tagline: 'Change dimensions, pick a format, keep it sharp.',
  category: 'image',
  input: { accepts: ['image'] },
  output: { kind: 'image', multiple: true },
  mode: 'local',
  defaultOptions: DEFAULT_OPTIONS,
  OptionsForm: ImageResizeOptionsForm,
  process: processImageResize,
};
