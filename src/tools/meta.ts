import type { ToolMeta } from '@/core/tool-types';
import { meta as imageResizeMeta } from './image-resize/meta';
import { meta as jsonFormatterMeta } from './json-formatter/meta';
import { meta as pdfMergeMeta } from './pdf-merge/meta';

/**
 * The canonical list of registered tools' metadata. Safe to import from
 * Server Components. Order here is the default sort order in listings.
 */
export const TOOLS_META: readonly ToolMeta[] = [imageResizeMeta, jsonFormatterMeta, pdfMergeMeta];

export function getToolMetaBySlug(slug: string): ToolMeta | undefined {
  return TOOLS_META.find((t) => t.slug === slug);
}

export function toolsByCategory(): Record<string, ToolMeta[]> {
  return TOOLS_META.reduce<Record<string, ToolMeta[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
}
