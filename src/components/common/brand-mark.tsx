import { cn } from '@/lib/cn';

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizeMap = {
  sm: { icon: 'size-6', text: 'text-base' },
  md: { icon: 'size-7', text: 'text-lg' },
  lg: { icon: 'size-9', text: 'text-2xl' },
} as const;

export function BrandMark({ className, showWordmark = true, size = 'md' }: BrandMarkProps) {
  const { icon, text } = sizeMap[size];
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden
        className={cn(
          'bg-primary text-primary-foreground inline-flex items-center justify-center rounded-lg font-bold',
          icon,
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-[62%]">
          <path
            d="M8 4h8l-4 6 4 10H8l4-10-4-6z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark ? (
        <span className={cn('font-semibold tracking-tight', text)}>
          Fix<span className="text-primary">It</span>
        </span>
      ) : null}
    </span>
  );
}
