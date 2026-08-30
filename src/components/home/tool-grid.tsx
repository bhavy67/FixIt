import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TOOLS_META } from '@/tools/meta';
import { getToolIcon } from '@/lib/tool-icons';
import { categoryIconBg, categoryIconColor } from '@/lib/tool-category-styles';
import { toolCategories } from '@/lib/site-config';
import { cn } from '@/lib/cn';

const categoryLabel = (slug: string) =>
  toolCategories.find((c) => c.slug === slug)?.label ?? slug;

// Show first 9 tools
const POPULAR = TOOLS_META.slice(0, 9);

export function ToolGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Popular
        </h2>
        <Link
          href="/tools"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          All 40+ tools <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {POPULAR.map((tool) => {
          const Icon = getToolIcon(tool.id, tool.category);
          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4
                transition-all duration-150 hover:shadow-sm hover:border-primary/20"
            >
              {/* Icon */}
              <div
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-xl',
                  categoryIconBg[tool.category] ?? 'bg-muted',
                )}
              >
                <Icon
                  className={cn('size-5', categoryIconColor[tool.category] ?? 'text-muted-foreground')}
                  aria-hidden
                />
              </div>
              {/* Text */}
              <div className="flex flex-col gap-1 flex-1">
                <p className="text-sm font-semibold leading-snug">{tool.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>
              {/* Hover arrow */}
              <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                Open <ArrowRight className="size-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
