// PDF Merge currently takes no options — files are merged in the order they were dropped.
// If a per-file reorder / include-toggle UI is added later, extend this type.
export type PdfMergeOptions = Record<string, never>;

export const DEFAULT_OPTIONS: PdfMergeOptions = {};
