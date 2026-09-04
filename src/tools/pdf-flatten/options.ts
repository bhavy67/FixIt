export interface PdfFlattenOptions {
  flattenForms: boolean;
  removeAnnotations: boolean;
}

export const DEFAULT_OPTIONS: PdfFlattenOptions = {
  flattenForms: true,
  removeAnnotations: true,
};
