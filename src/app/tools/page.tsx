import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TOOLS_META, toolsByCategory } from '@/tools/meta';
import { toolCategories } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'All tools',
  description: `Every FixIt tool. ${TOOLS_META.length} local-first browser utilities — nothing uploaded, nothing installed.`,
  openGraph: {
    title: 'All tools · FixIt',
    description: 'Local-first browser utilities for annoying file operations.',
    type: 'website',
  },
};

export default function ToolsIndexPage() {
  const byCategory = toolsByCategory();
  const orderedCategories = toolCategories.filter((c) => byCategory[c.slug]?.length);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">All tools</h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm sm:text-base">
          Every FixIt tool runs locally in your browser. Nothing to install, nothing uploaded.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {orderedCategories.map((category) => {
          const tools = byCategory[category.slug] ?? [];
          return (
            <section key={category.slug} aria-labelledby={`cat-${category.slug}`}>
              <h2
                id={`cat-${category.slug}`}
                className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase"
              >
                {category.label}
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <li key={tool.id}>
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
                            {category.label}
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
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </main>
  );
}
