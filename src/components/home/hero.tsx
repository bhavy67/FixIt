import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { siteConfig, toolCategories } from '@/lib/site-config';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
        <Badge variant="secondary" className="mb-5 rounded-full font-medium">
          <ShieldCheck className="size-3" aria-hidden />
          Local-first · no upload
        </Badge>

        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          <span className="text-primary">Drop it.</span> Fix it. Done.
        </h1>

        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base text-balance sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild className="min-w-40">
            <Link href="/tools">
              Browse tools
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Zap className="size-3.5" aria-hidden />
            Drag-and-drop workspace arrives soon
          </span>
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
