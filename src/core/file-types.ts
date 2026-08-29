export type FileKind = 'pdf' | 'image' | 'json' | 'csv' | 'text' | 'markdown' | 'zip' | 'unknown';

export interface InspectedFile {
  id: string;
  file: File;
  kind: FileKind;
  mime: string;
  ext: string;
  name: string;
  sizeBytes: number;
}
