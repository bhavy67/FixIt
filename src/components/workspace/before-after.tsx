'use client';

import { useObjectURL } from '@/hooks/use-object-url';
import { formatBytes } from '@/lib/format-bytes';

type Props = {
  originalFile: File;
  outputBlob: Blob;
};

export function BeforeAfter({ originalFile, outputBlob }: Props) {
  const beforeUrl = useObjectURL(originalFile);
  const afterUrl = useObjectURL(outputBlob);
  const savedBytes = originalFile.size - outputBlob.size;
  const savedPct = originalFile.size > 0 ? (savedBytes / originalFile.size) * 100 : 0;

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
      <div className="grid grid-cols-2 gap-3">
        <figure className="flex flex-col gap-1.5">
          <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg">
            {beforeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beforeUrl} alt="Before" className="h-full w-full object-contain" />
            ) : null}
          </div>
          <figcaption className="text-muted-foreground text-center text-xs">
            Before · {formatBytes(originalFile.size)}
          </figcaption>
        </figure>
        <figure className="flex flex-col gap-1.5">
          <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-lg">
            {afterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={afterUrl} alt="After" className="h-full w-full object-contain" />
            ) : null}
          </div>
          <figcaption className="text-muted-foreground text-center text-xs">
            After · {formatBytes(outputBlob.size)}
          </figcaption>
        </figure>
      </div>
      {savedBytes > 0 ? (
        <p className="text-primary text-center text-xs font-medium">
          {Math.round(savedPct)}% smaller
        </p>
      ) : null}
    </div>
  );
}
