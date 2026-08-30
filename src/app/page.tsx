import { Hero } from '@/components/home/hero';
import { ToolGrid } from '@/components/home/tool-grid';
import { RecentTools } from '@/components/home/recent-tools';
import { InstallPrompt } from '@/components/home/install-prompt';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <InstallPrompt />
        </div>
      </section>
      <RecentTools />
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl">
          <ToolGrid />
        </div>
      </section>
    </main>
  );
}
