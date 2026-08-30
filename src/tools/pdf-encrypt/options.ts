export type PdfEncryptOptions = {
  userPassword: string; // password to open the PDF
  ownerPassword: string; // optional permissions password; if empty, same as userPassword
};

export const DEFAULT_OPTIONS: PdfEncryptOptions = {
  userPassword: '',
  ownerPassword: '',
};
