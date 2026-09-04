import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfExtractImagesOptions } from './options';

export async function processPdfExtractImages(
  ctx: ProcessingContext<PdfExtractImagesOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;
  const file = files[0]!;

  onProgress(0.05);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  onProgress(0.1);
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pageCount = pdf.numPages;

  const outputs: { blob: Blob; filename: string; bytes: number }[] = [];
  const seenNames = new Set<string>();
  let imgIndex = 0;

  const mime = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const ext = options.format === 'jpeg' ? 'jpg' : 'png';
  const quality = options.format === 'jpeg' ? options.quality / 100 : undefined;
  const base = file.name.replace(/\.pdf$/i, '');

  const { OPS } = pdfjsLib;
  // OPS may not have paintJpegXObject in all versions; cast to any-keyed record for safety
  const ops = OPS as Record<string, number>;
  const PAINT_JPEG = ops['paintJpegXObject'] ?? -1;
  const PAINT_IMG = OPS.paintImageXObject;
  const PAINT_INLINE = OPS.paintInlineImageXObject;

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const page = await pdf.getPage(pageNum);
    const opList = await page.getOperatorList();

    for (let i = 0; i < opList.fnArray.length; i++) {
      const fn = opList.fnArray[i];
      const isInline = fn === PAINT_INLINE;
      const isXObject = fn === PAINT_JPEG || fn === PAINT_IMG;
      if (!isInline && !isXObject) continue;

      let bitmap: ImageBitmap | null = null;
      let imgW = 0;
      let imgH = 0;

      if (isInline) {
        // Inline image — data is directly in argsArray[i][0]
        const inlineImg = opList.argsArray[i][0] as {
          data: Uint8Array;
          width: number;
          height: number;
          numComps?: number;
          kind?: number;
        };
        imgW = inlineImg.width;
        imgH = inlineImg.height;
        if (imgW < options.minSize || imgH < options.minSize) continue;

        const numComps = inlineImg.numComps ?? 3;
        const rgba = new Uint8ClampedArray(imgW * imgH * 4);
        for (let p = 0; p < imgW * imgH; p++) {
          if (numComps === 1) {
            const v = inlineImg.data[p] ?? 0;
            rgba[p * 4] = v;
            rgba[p * 4 + 1] = v;
            rgba[p * 4 + 2] = v;
          } else {
            rgba[p * 4] = inlineImg.data[p * numComps] ?? 0;
            rgba[p * 4 + 1] = inlineImg.data[p * numComps + 1] ?? 0;
            rgba[p * 4 + 2] = inlineImg.data[p * numComps + 2] ?? 0;
          }
          rgba[p * 4 + 3] = 255;
        }
        bitmap = await createImageBitmap(new ImageData(rgba, imgW, imgH));
      } else {
        // XObject image — fetch from page.objs by name
        const name = opList.argsArray[i][0] as string;
        if (seenNames.has(name)) continue;
        seenNames.add(name);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imgObj = await new Promise<any>((resolve) => {
          page.objs.get(name, resolve);
        });
        if (!imgObj) continue;

        imgW = imgObj.width ?? 0;
        imgH = imgObj.height ?? 0;
        if (imgW < options.minSize || imgH < options.minSize) continue;

        if (imgObj.bitmap) {
          bitmap = imgObj.bitmap as ImageBitmap;
        } else if (imgObj.data) {
          const data = imgObj.data as Uint8Array;
          const nc = Math.round(data.length / (imgW * imgH));
          const rgba = new Uint8ClampedArray(imgW * imgH * 4);
          for (let p = 0; p < imgW * imgH; p++) {
            if (nc >= 3) {
              rgba[p * 4] = data[p * nc] ?? 0;
              rgba[p * 4 + 1] = data[p * nc + 1] ?? 0;
              rgba[p * 4 + 2] = data[p * nc + 2] ?? 0;
              rgba[p * 4 + 3] = nc === 4 ? (data[p * nc + 3] ?? 255) : 255;
            } else {
              const v = data[p] ?? 0;
              rgba[p * 4] = v;
              rgba[p * 4 + 1] = v;
              rgba[p * 4 + 2] = v;
              rgba[p * 4 + 3] = 255;
            }
          }
          bitmap = await createImageBitmap(new ImageData(rgba, imgW, imgH));
        }
      }

      if (!bitmap) continue;

      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = imgH;
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) continue;
      ctx2d.drawImage(bitmap, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('canvas export failed'))),
          mime,
          quality,
        ),
      );

      imgIndex++;
      outputs.push({ blob, filename: `${base}-img-${imgIndex}.${ext}`, bytes: blob.size });
    }

    onProgress(0.1 + (pageNum / pageCount) * 0.85);
  }

  if (outputs.length === 0) {
    throw new Error(
      'No images found in this PDF. It may contain only text or vector graphics.',
    );
  }

  onProgress(1);
  return { outputs };
}
