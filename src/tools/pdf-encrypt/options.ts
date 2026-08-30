export interface PdfEncryptOptions {
  userPassword: string;
  ownerPassword: string;
}

export const DEFAULT_OPTIONS: PdfEncryptOptions = {
  userPassword: '',
  ownerPassword: '',
};
