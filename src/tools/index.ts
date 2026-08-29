import { registerTool } from '@/core/tool-registry';
import { imageResizeTool } from './image-resize/definition';

// Side effect: run once when this module is first imported.
let registered = false;
function ensureRegistered(): void {
  if (registered) return;
  registered = true;
  registerTool(imageResizeTool);
}

ensureRegistered();

/** Idempotent re-registration hook (useful for tests). */
export function registerAllTools(): void {
  registered = false;
  ensureRegistered();
}
