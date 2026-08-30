'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ToolMeta } from '@/core/tool-types';
import type { ToolCategory } from '@/lib/site-config';

type Props = {
  tools: readonly ToolMeta[];
  categories: readonly ToolCategory[];
};

const inputCls =
  'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 w-full rounded-md border px-3 pl-9 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none';

export function ToolsIndexClient({ tools, categories }: Props) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase().trim();

  const filtered = useMemo(
    () =>
      q
        ? tools.filter(
            (t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q),
          )
        : tools,
    [tools, q],
  );

  const orderedCategories = useMemo(() => {
    const byCategory: Record<string, ToolMeta[]> = {};
    for (const t of filtered) {
      (byCategory[t.category] ??= []).push(t);
    }
    return categories
      .filter((c) => byCategory[c.slug]?.length)
      .map((c) => ({ ...c, tools: byCategory[c.slug]! }));
  }, [filtered, categories]);

  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;

  return (
    <>
      <div className="relative mb-8 mx-auto max-w-sm">
        <Search
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${tools.length} tools…`}
          className={inputCls}
          aria-label="Filter tools"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center text-sm">
          No tools match &ldquo;{query}&rdquo;.
        </p>
      ) : q ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} categoryLabel={categoryLabel(tool.category)} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-10">
          {orderedCategories.map((cat) => (
            <section key={cat.slug} aria-labelledby={`cat-${cat.slug}`}>
              <h2
                id={`cat-${cat.slug}`}
                className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase"
              >
                {cat.label}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {cat.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} categoryLabel={cat.label} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function ToolCard({ tool, categoryLabel }: { tool: ToolMeta; categoryLabel: string }) {
  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        className="group focus-visible:ring-ring focus-visible:ring-offset-background block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Card className="group-hover:border-primary/50 h-full gap-3 transition-colors">
          <CardHeader>
            <Badge
              variant="outline"
              className="mb-1 w-fit text-[10px] font-normal tracking-wider uppercase"
            >
              {categoryLabel}
            </Badge>
            <CardTitle className="text-base">{tool.name}</CardTitle>
            <CardAction>
              <ArrowUpRight
                className="text-muted-foreground group-hover:text-primary size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardDescription>{tool.tagline}</CardDescription>
          </CardContent>
        </Card>
      </Link>
    </li>
  );
}
