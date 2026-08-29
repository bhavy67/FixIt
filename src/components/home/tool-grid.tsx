import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { popularTools, toolCategories } from '@/lib/site-config';

const categoryLabel = (slug: string) => toolCategories.find((c) => c.slug === slug)?.label ?? slug;

export function ToolGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Popular</h2>
        <Link
          href="/tools"
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
        >
          All tools →
        </Link>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {popularTools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href="/tools"
              aria-label={`${tool.name} — coming soon`}
              className="group focus-visible:ring-ring focus-visible:ring-offset-background block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Card className="group-hover:border-primary/50 h-full gap-3 transition-colors">
                <CardHeader>
                  <Badge variant="outline" className="mb-1 w-fit text-xs font-normal">
                    {categoryLabel(tool.category)}
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
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
