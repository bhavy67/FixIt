import { Shield, Zap, Package, Globe } from 'lucide-react';
import { Workspace } from '@/components/drop/workspace';

const features = [
  { icon: Shield, label: 'Files never leave your device' },
  { icon: Zap, label: 'Instant results' },
  { icon: Package, label: '40+ tools' },
  { icon: Globe, label: 'Works offline' },
] as const;

export function Hero() {
  return (
    <>
      <section className="flex flex-col items-center pt-16 pb-8 px-4 text-center gap-6">
        {/* Tagline chip */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary inline-block" />
          100% local &middot; nothing uploaded
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight max-w-lg">
          Drop it.<br />
          <span className="text-primary">Fix it.</span><br />
          Done.
        </h1>

        {/* One-line sub */}
        <p className="text-muted-foreground text-lg max-w-sm">
          40+ file tools that run entirely in your browser.
        </p>
      </section>

      {/* Workspace — full width, large container */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-6xl">
          <Workspace />
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-border bg-card/50 py-4 px-4">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
