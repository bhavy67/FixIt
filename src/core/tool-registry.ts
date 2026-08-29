import type { InspectedFile } from './file-types';
import type { ToolDefinition } from './tool-types';

const tools = new Map<string, ToolDefinition<unknown>>();

export function registerTool<Options>(tool: ToolDefinition<Options>): void {
  if (tools.has(tool.id)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[tool-registry] tool '${tool.id}' is already registered; skipping.`);
    }
    return;
  }
  tools.set(tool.id, tool as ToolDefinition<unknown>);
}

export function getToolById(id: string): ToolDefinition<unknown> | undefined {
  return tools.get(id);
}

export function getAllTools(): ToolDefinition<unknown>[] {
  return Array.from(tools.values());
}

export function matchToolsForFiles(files: readonly InspectedFile[]): ToolDefinition<unknown>[] {
  if (files.length === 0) return [];
  return getAllTools().filter((tool) => matches(tool, files));
}

function matches(tool: ToolDefinition<unknown>, files: readonly InspectedFile[]): boolean {
  const min = tool.input.minFiles ?? 1;
  const max = tool.input.maxFiles;
  if (files.length < min) return false;
  if (max !== undefined && files.length > max) return false;
  return files.every((f) => tool.input.accepts.includes(f.kind));
}

// Test helper — resets registry between test cases.
export function _resetRegistryForTests(): void {
  tools.clear();
}
