'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, PackageOpen } from 'lucide-react';
import type { ToolMeta } from '@/core/tool-types';
import type { ToolCategory } from '@/lib/site-config';
import { cn } from '@/lib/cn';
import { getToolIcon } from '@/lib/tool-icons';
import { categoryIconBg, categoryIconColor, categoryDot } from '@/lib/tool-category-styles';

type Props = {
  tools: readonly ToolMeta[];
  categories: readonly ToolCategory[];
};

export function ToolsIndexClient({ tools, categories }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const q = query.toLowerCase().trim();

  const filteredTools = useMemo(() => {
    let result = tools;
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory);
    }
    if (q) {
      result = result.filter(
        (t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q),
      );
    }
    return result;
  }, [tools, activeCategory, q]);

  const tabSlugs = ['all', ...categories.map((c) => c.slug)];

  return (
    <div className="flex flex-col gap-6">
      {/* Search + category tabs row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools…"
            aria-label="Filter tools"
            autoComplete="off"
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-border bg-background text-sm
              focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        {/* Category tabs — horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
          {tabSlugs.map((slug) => {
            const label =
              slug === 'all'
                ? 'All'
                : (categories.find((c) => c.slug === slug)?.label ?? slug);
            const count =
              slug === 'all'
                ? tools.length
                : tools.filter((t) => t.category === slug).length;
            const isActive = activeCategory === slug;
            return (
              <button
                key={slug}
                onClick={() => setActiveCategory(slug)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 h-9 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30',
                )}
              >
                {slug !== 'all' && (
                  <span className={cn('size-1.5 rounded-full', categoryDot[slug])} />
                )}
                {label}
                <span
                  className={cn(
                    'text-[10px] tabular-nums',
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped view (no search, all categories) */}
      {!q && activeCategory === 'all' &&
        categories.map((category) => {
          const catTools = tools.filter((t) => t.category === category.slug);
          if (catTools.length === 0) return null;
          return (
            <div key={category.slug}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('size-2 rounded-full', categoryDot[category.slug])} />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category.label}
                </h2>
                <span className="text-xs text-muted-foreground">({catTools.length})</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {catTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          );
        })}

      {/* Filtered/searched view */}
      {(q || activeCategory !== 'all') && filteredTools.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredTools.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="rounded-xl bg-muted p-4">
            <PackageOpen className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No tools found</p>
          <p className="text-muted-foreground text-xs">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolMeta }) {
  const Icon = getToolIcon(tool.id, tool.category);
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4
        transition-all duration-150 hover:shadow-sm hover:border-primary/20"
    >
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
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-sm font-semibold leading-snug">{tool.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{tool.tagline}</p>
      </div>
    </Link>
  );
}
