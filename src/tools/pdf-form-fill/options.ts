export interface PdfFormFillOptions {
  fields: string; // "fieldName: value\nanotherField: value2"
  flatten: boolean;
}

export const DEFAULT_OPTIONS: PdfFormFillOptions = { fields: '', flatten: true };
