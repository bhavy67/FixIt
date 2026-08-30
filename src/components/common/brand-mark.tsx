import { cn } from '@/lib/cn';

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { box: 'size-[30px] rounded-[8px]',  text: 'text-[15px]', gap: 'gap-[8px]' },
  md: { box: 'size-[34px] rounded-[9px]',  text: 'text-[17px]', gap: 'gap-[9px]' },
  lg: { box: 'size-[42px] rounded-[11px]', text: 'text-[21px]', gap: 'gap-[11px]' },
} as const;

/**
 * The brand mark — a custom F letterform. The crossbar is a rising diagonal
 * instead of a flat line, giving it energy. The F IS the first letter, so:
 *   [F mark] + "ix" (sans) + "it" (mono) = "Fixit"
 *
 * The font-switch mid-word is intentional: "Fix" reads as one unit,
 * then "it" snaps into Geist Mono — the pronoun feels like a code token.
 */
function FMark({ boxClass }: { boxClass: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        'bg-gradient-to-br from-violet-500 to-fuchsia-600',
        'shadow-md shadow-violet-500/40',
        boxClass,
      )}
    >
      <svg viewBox="0 0 22 22" fill="none" className="w-[58%] h-[58%]">
        {/* F — vertical stem */}
        <rect x="3" y="2" width="3.2" height="18" rx="1.6" fill="white" />
        {/* F — top horizontal bar */}
        <rect x="3" y="2" width="14" height="3.2" rx="1.6" fill="white" />
        {/* F — crossbar: rising diagonal instead of flat line — gives the mark spark */}
        <path
          d="M 3 14.5 L 17 10"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function BrandMark({ className, showWordmark = true, size = 'md' }: BrandMarkProps) {
  const { box, text, gap } = sizeMap[size];

  return (
    <span className={cn('inline-flex items-center', gap, className)}>
      <FMark boxClass={box} />

      {showWordmark && (
        <span className={cn('leading-none tracking-tight select-none', text)}>
          {/* "ix" — Geist Sans, medium weight, foreground */}
          <span className="font-semibold text-foreground">ix</span>
          {/*
           * "it" — Geist Mono, bold, primary (violet).
           * Font-switch here is the design move: "it" reads as a code token,
           * the pronoun pops visually, and the violet echoes the mark.
           */}
          <span className="font-mono font-bold text-primary">it</span>
        </span>
      )}
    </span>
  );
}
