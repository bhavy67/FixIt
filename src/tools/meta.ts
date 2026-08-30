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
import { meta as pdfToJpgMeta } from './pdf-to-jpg/meta';
import { meta as pdfToPngMeta } from './pdf-to-png/meta';
import { meta as pdfToWebpMeta } from './pdf-to-webp/meta';
import { meta as jpgToPdfMeta } from './jpg-to-pdf/meta';
import { meta as pngToPdfMeta } from './png-to-pdf/meta';
import { meta as imagesToPdfMeta } from './images-to-pdf/meta';
import { meta as pdfWatermarkMeta } from './pdf-watermark/meta';
import { meta as pdfPageNumbersMeta } from './pdf-page-numbers/meta';
import { meta as pdfPageSizeMeta } from './pdf-page-size/meta';
import { meta as pdfRepairMeta } from './pdf-repair/meta';
import { meta as pdfCompareMeta } from './pdf-compare/meta';
import { meta as pdfFingerprintMeta } from './pdf-fingerprint/meta';
import { meta as pdfFlattenMeta } from './pdf-flatten/meta';
import { meta as pdfExtractTextMeta } from './pdf-extract-text/meta';
import { meta as pdfHeadersFootersMeta } from './pdf-headers-footers/meta';
import { meta as pdfToAudioMeta } from './pdf-to-audio/meta';

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
  pdfToJpgMeta,
  pdfToPngMeta,
  pdfToWebpMeta,
  jpgToPdfMeta,
  pngToPdfMeta,
  imagesToPdfMeta,
  pdfWatermarkMeta,
  pdfPageNumbersMeta,
  pdfPageSizeMeta,
  pdfRepairMeta,
  pdfCompareMeta,
  pdfFingerprintMeta,
  pdfFlattenMeta,
  pdfExtractTextMeta,
  pdfHeadersFootersMeta,
  pdfToAudioMeta,
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
