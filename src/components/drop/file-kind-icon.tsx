import {
  File,
  FileArchive,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  type LucideIcon,
} from 'lucide-react';
import type { FileKind } from '@/core/file-types';
import { cn } from '@/lib/cn';

const iconMap: Record<FileKind, LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  json: FileJson,
  csv: FileSpreadsheet,
  text: FileText,
  markdown: FileCode,
  zip: FileArchive,
  unknown: File,
};

const labelMap: Record<FileKind, string> = {
  pdf: 'PDF',
  image: 'Image',
  json: 'JSON',
  csv: 'CSV',
  text: 'Text',
  markdown: 'Markdown',
  zip: 'ZIP',
  unknown: 'File',
};

export const fileKindLabel = (kind: FileKind): string => labelMap[kind];

type Props = {
  kind: FileKind;
  className?: string;
};

export function FileKindIcon({ kind, className }: Props) {
  const Icon = iconMap[kind];
  return (
    <div
      className={cn(
        'bg-secondary text-secondary-foreground inline-flex items-center justify-center rounded-lg',
        className,
      )}
      aria-hidden
    >
      <Icon className="size-5" />
    </div>
  );
}
