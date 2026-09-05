import JSZip from 'jszip';
import type { ProcessingResultBlob } from './tool-types';

/**
 * Packs a list of ProcessingResultBlobs into a single ZIP archive.
 * Used by pdf-to-jpg/png/webp when the user opts in to bundling.
 */
export async function bundleAsZip(
  outputs: ProcessingResultBlob[],
  zipFilename: string,
): Promise<ProcessingResultBlob> {
  const zip = new JSZip();
  for (const out of outputs) {
    zip.file(out.filename, out.blob);
  }
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  return { blob, filename: zipFilename, bytes: blob.size };
}
