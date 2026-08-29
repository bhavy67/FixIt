import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Workspace } from '@/components/drop/workspace';
import { siteConfig, toolCategories } from '@/lib/site-config';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 pt-14 pb-12 text-center sm:px-6 sm:pt-20 sm:pb-16">
        <Badge variant="secondary" className="mb-5 rounded-full font-medium">
          <ShieldCheck className="size-3" aria-hidden />
          Local-first · no upload
        </Badge>

        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          <span className="text-primary">Drop it.</span> Fix it. Done.
        </h1>

        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base text-balance sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="mt-8 sm:mt-10">
          <Workspace />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {toolCategories.map((c) => (
            <span
              key={c.slug}
              className="border-border bg-background text-muted-foreground inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium"
            >
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
