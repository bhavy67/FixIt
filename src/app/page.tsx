import { Hero } from '@/components/home/hero';
import { ToolGrid } from '@/components/home/tool-grid';
import { RecentTools } from '@/components/home/recent-tools';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RecentTools />
      <ToolGrid />
    </main>
  );
}
