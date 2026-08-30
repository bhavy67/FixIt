import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfEncryptOptions } from './options';

export async function processPdfEncrypt(
  ctx: ProcessingContext<PdfEncryptOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;

  if (options.userPassword.trim() === '') {
    throw new Error('Password cannot be empty.');
  }

  const outputs: { blob: Blob; filename: string; bytes: number }[] = [];

  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const file = files[i]!;
    onProgress((i / files.length) * 0.9 + 0.05);

    const buffer = await file.file.arrayBuffer();
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer);

    const bytes = await pdfDoc.save(
      // pdf-lib 1.x save options typings don't include password fields;
      // cast to unknown first to allow the extra properties through.
      {
        userPassword: options.userPassword,
        ownerPassword: options.ownerPassword || options.userPassword,
      } as unknown as Parameters<typeof pdfDoc.save>[0],
    );

    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
    const base = file.name.replace(/\.pdf$/i, '');
    outputs.push({ blob, filename: `${base}-protected.pdf`, bytes: blob.size });

    onProgress(((i + 1) / files.length) * 0.9 + 0.05);
  }

  onProgress(1);
  return { outputs };
}
