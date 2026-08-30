export type SignMode = 'draw' | 'type';

export type PdfSignOptions = {
  signMode: SignMode;
  signatureDataUrl: string;
  typedText: string;
  color: string;
  page: number;
  // normalized (0–1) relative to PDF page dimensions (screen coords: origin top-left)
  sigX: number;
  sigY: number;
  sigW: number;
};

export const DEFAULT_OPTIONS: PdfSignOptions = {
  signMode: 'draw',
  signatureDataUrl: '',
  typedText: '',
  color: '#1a1a1a',
  page: 1,
  sigX: 0.55,
  sigY: 0.78,
  sigW: 0.3,
};
