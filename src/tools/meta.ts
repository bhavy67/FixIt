import type { ToolMeta } from '@/core/tool-types';
import { meta as imageResizeMeta } from './image-resize/meta';
import { meta as jsonFormatterMeta } from './json-formatter/meta';
import { meta as pdfMergeMeta } from './pdf-merge/meta';
import { meta as pdfSplitMeta } from './pdf-split/meta';
import { meta as pdfExtractPagesMeta } from './pdf-extract-pages/meta';
import { meta as pdfDeletePagesMeta } from './pdf-delete-pages/meta';
import { meta as pdfReorderPagesMeta } from './pdf-reorder-pages/meta';
import { meta as pdfRotateMeta } from './pdf-rotate/meta';
import { meta as pdfCompressMeta } from './pdf-compress/meta';
import { meta as pdfMetaRemoverMeta } from './pdf-metadata-remover/meta';
import { meta as pdfMetaViewerMeta } from './pdf-metadata-viewer/meta';

/**
 * The canonical list of registered tools' metadata. Safe to import from
 * Server Components. Order here is the default sort order in listings.
 */
export const TOOLS_META: readonly ToolMeta[] = [
  imageResizeMeta,
  jsonFormatterMeta,
  pdfMergeMeta,
  pdfSplitMeta,
  pdfExtractPagesMeta,
  pdfDeletePagesMeta,
  pdfReorderPagesMeta,
  pdfRotateMeta,
  pdfCompressMeta,
  pdfMetaRemoverMeta,
  pdfMetaViewerMeta,
];

export function getToolMetaBySlug(slug: string): ToolMeta | undefined {
  return TOOLS_META.find((t) => t.slug === slug);
}

export function toolsByCategory(): Record<string, ToolMeta[]> {
  return TOOLS_META.reduce<Record<string, ToolMeta[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
}
