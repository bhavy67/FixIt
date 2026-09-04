export type PdfToAudioOptions = {
  voiceURI: string;
  rate: number;
  pitch: number;
};

export const DEFAULT_OPTIONS: PdfToAudioOptions = {
  voiceURI: '',
  rate: 1,
  pitch: 1,
};
