import type { FileKind, InspectedFile } from './file-types';

const MAGIC_SNIFF_BYTES = 12;

function bytesStartWith(bytes: Uint8Array, prefix: number[], offset = 0): boolean {
  if (bytes.length < offset + prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (bytes[offset + i] !== prefix[i]) return false;
  }
  return true;
}

function detectKindFromMagic(bytes: Uint8Array): FileKind | null {
  // PDF: %PDF-
  if (bytesStartWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf';
  // PNG
  if (bytesStartWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image';
  // JPEG
  if (bytesStartWith(bytes, [0xff, 0xd8, 0xff])) return 'image';
  // GIF87a / GIF89a
  if (bytesStartWith(bytes, [0x47, 0x49, 0x46, 0x38])) return 'image';
  // WebP: RIFF....WEBP
  if (
    bytesStartWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytesStartWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image';
  }
  // ZIP (also DOCX/XLSX/etc., but we classify as zip here)
  if (bytesStartWith(bytes, [0x50, 0x4b, 0x03, 0x04])) return 'zip';
  return null;
}

function detectKindFromMime(mime: string): FileKind | null {
  if (!mime) return null;
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/json') return 'json';
  if (mime === 'text/csv') return 'csv';
  if (mime === 'text/markdown') return 'markdown';
  if (mime === 'application/zip' || mime === 'application/x-zip-compressed') return 'zip';
  if (mime.startsWith('text/')) return 'text';
  return null;
}

function detectKindFromExtension(ext: string): FileKind | null {
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
    case 'avif':
    case 'heic':
    case 'heif':
    case 'bmp':
    case 'svg':
      return 'image';
    case 'json':
      return 'json';
    case 'csv':
    case 'tsv':
      return 'csv';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'txt':
    case 'log':
      return 'text';
    case 'zip':
      return 'zip';
    default:
      return null;
  }
}

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  if (idx === -1 || idx === name.length - 1) return '';
  return name.slice(idx + 1).toLowerCase();
}

async function readMagicBytes(file: File): Promise<Uint8Array> {
  const slice = file.slice(0, MAGIC_SNIFF_BYTES);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function inspectFile(file: File): Promise<InspectedFile> {
  const ext = getExtension(file.name);
  const mime = file.type || '';

  let kind: FileKind | null = null;
  try {
    if (file.size > 0) {
      const bytes = await readMagicBytes(file);
      kind = detectKindFromMagic(bytes);
    }
  } catch {
    // Reading may fail on empty/unreadable files — fall through to MIME/ext.
  }

  if (!kind) kind = detectKindFromMime(mime);
  if (!kind) kind = detectKindFromExtension(ext);
  if (!kind) kind = 'unknown';

  return {
    id: generateId(),
    file,
    kind,
    mime,
    ext,
    name: file.name,
    sizeBytes: file.size,
  };
}

export async function inspectFiles(files: readonly File[]): Promise<InspectedFile[]> {
  return Promise.all(files.map(inspectFile));
}
