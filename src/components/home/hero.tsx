import { Shield, Zap, Package, Globe } from 'lucide-react';
import { Workspace } from '@/components/drop/workspace';
import { PrivacyTagline } from '@/components/common/privacy-tagline';

const features = [
  { icon: Shield, label: 'Files never leave your device' },
  { icon: Zap, label: 'Instant results' },
  { icon: Package, label: '40+ tools' },
  { icon: Globe, label: 'Works offline' },
] as const;

/** The F mark SVG — identical to BrandMark, sized for heading scale */
function HeroFMark() {
  return (
    <span className="inline-flex items-center justify-center shrink-0 size-11 sm:size-[54px] rounded-[11px] sm:rounded-[14px] bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/35">
      <svg viewBox="0 0 22 22" fill="none" className="w-[58%] h-[58%]" aria-hidden>
        <rect x="3" y="2" width="3.2" height="18" rx="1.6" fill="white" />
        <rect x="3" y="2" width="14" height="3.2" rx="1.6" fill="white" />
        <path d="M 3 14.5 L 17 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Hero() {
  return (
    <>
      <section className="flex flex-col items-center pt-12 pb-8 px-4 text-center gap-5">
        {/* Tagline chip */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-primary inline-block shrink-0" />
          <PrivacyTagline />
        </div>

        {/*
         * Heading: "Drop it. [F]ixit Done."
         * The brand mark lives inline — the logo IS the verb.
         * One line on desktop, wraps gracefully on mobile.
         */}
        <h1 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 leading-none">
          <span className="text-4xl sm:text-5xl font-bold tracking-tight text-muted-foreground/50">
            Drop it.
          </span>

          <span className="inline-flex items-center gap-2.5">
            <HeroFMark />
            <span className="text-4xl sm:text-5xl tracking-tight">
              <span className="font-semibold text-foreground">ix</span>
              <span className="font-mono font-bold text-primary">it</span>
            </span>
          </span>

          <span className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Done.
          </span>
        </h1>

        {/* Sub */}
        <p className="text-muted-foreground text-lg max-w-sm">
          40+ file tools that run entirely in your browser.
        </p>
      </section>

      {/* Workspace */}
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
