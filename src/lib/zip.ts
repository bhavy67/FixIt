export async function zipBlobs(
  entries: readonly { filename: string; blob: Blob }[],
  zipFilename: string,
): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  for (const { filename, blob } of entries) {
    zip.file(filename, blob);
  }

  const content = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipFilename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
