# FixIt

> Drop it. Fix it. Done.

A local-first browser utility for annoying file operations. Everything runs in your browser — nothing is uploaded.

## Status

Phase 2 · Design system & shell complete. Responsive header, mobile drawer nav, footer, hero, popular-tools grid, light/dark theme. No functional tools yet.

## Tech

- Next.js 15 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (new-york, blue)
- Geist font
- Vitest + React Testing Library
- Playwright (desktop + mobile viewports)
- pnpm

## Scripts

```bash
pnpm dev         # start dev server
pnpm build       # production build
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm test        # unit tests (vitest)
pnpm test:e2e    # playwright
pnpm format      # prettier --write .
```

## Structure

```
src/
├── app/           # Next.js routes
├── components/    # UI (ui, layout, common)
├── core/          # tool-registry, file-inspector, engine (future phases)
├── stores/        # Zustand slices (future phases)
├── tools/         # tool implementations (future phases)
├── hooks/
├── lib/
├── styles/
└── types/
tests/
├── unit/
└── e2e/
```

## Roadmap

1. Foundation ✅
2. Design system & shell ✅
3. File inspection + drop experience
4. Tool registry + engine
5. First tool: Image Resize
6. JSON Formatter
7. PDF Merge (worker + pdf-lib)
8. Tool pages + SEO + polish
