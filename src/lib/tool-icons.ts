import type { LucideIcon } from 'lucide-react';
import {
  Layers,
  Scissors,
  Copy,
  Trash2,
  ArrowUpDown,
  RotateCcw,
  Minimize2,
  Maximize2,
  FileText,
  ImageIcon,
  Hash,
  Volume2,
  Crop,
  EyeOff,
  Fingerprint,
  PenTool,
  AlignCenter,
  Code2,
  BookOpen,
  Archive,
  FileCode,
  Wrench,
  Shield,
  Braces,
  ScanLine,
  FileSearch,
  FileImage,
  Images,
  Scaling,
  PenLine,
  Table2,
  Stamp,
  FileType,
  Contrast,
} from 'lucide-react';

const TOOL_ICONS: Record<string, LucideIcon> = {
  // Image
  'resize-image': Scaling,

  // Data
  'json-formatter': Braces,

  // PDF - core operations
  'pdf-merge': Layers,
  'pdf-split': Scissors,
  'pdf-extract-pages': Copy,
  'pdf-delete-pages': Trash2,
  'pdf-reorder-pages': ArrowUpDown,
  'pdf-rotate': RotateCcw,
  'pdf-compress': Minimize2,
  'pdf-page-size': Maximize2,
  'pdf-page-numbers': Hash,
  'pdf-repair': Wrench,
  'pdf-compare': FileSearch,
  'pdf-flatten': Layers,
  'pdf-extract-text': FileText,
  'pdf-headers-footers': AlignCenter,
  'pdf-to-audio': Volume2,
  'pdf-to-zip': Archive,
  'pdf-invert-colors': Contrast,
  'pdf-form-fill': PenLine,
  'pdf-watermark': Stamp,

  // PDF → image
  'pdf-to-jpg': FileImage,
  'pdf-to-png': FileImage,
  'pdf-to-webp': FileImage,

  // image → PDF
  'jpg-to-pdf': ImageIcon,
  'png-to-pdf': ImageIcon,
  'images-to-pdf': Images,

  // PDF Security
  'pdf-metadata-remover': EyeOff,
  'pdf-metadata-viewer': FileSearch,
  'pdf-fingerprint': Fingerprint,
  'pdf-sign': PenTool,
  'pdf-crop': Crop,
  'pdf-redact': EyeOff,

  // Conversion → PDF
  'markdown-to-pdf': FileCode,
  'html-to-pdf': Code2,
  'txt-to-pdf': FileType,
  'csv-to-pdf': Table2,
  'epub-to-pdf': BookOpen,

  // OCR
  'pdf-ocr': ScanLine,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  pdf: FileText,
  'pdf-security': Shield,
  image: ImageIcon,
  data: Braces,
  text: FileCode,
};

export function getToolIcon(toolId: string, category: string): LucideIcon {
  return TOOL_ICONS[toolId] ?? CATEGORY_ICONS[category] ?? FileText;
}
