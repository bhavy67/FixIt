export const siteConfig = {
  name: 'FixIt',
  tagline: 'Drop it. Fix it. Done.',
  description:
    'A local-first browser utility for annoying file operations. Nothing to install, nothing uploaded — everything happens on your device.',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const navItems: readonly NavItem[] = [
  { label: 'Tools', href: '/tools' },
  { label: 'Workflow', href: '/workflow' },
];

export type ToolCategory = {
  slug: 'pdf' | 'image' | 'data' | 'text' | 'pdf-security';
  label: string;
};

export const toolCategories: readonly ToolCategory[] = [
  { slug: 'pdf', label: 'PDF' },
  { slug: 'pdf-security', label: 'PDF Security' },
  { slug: 'image', label: 'Images' },
  { slug: 'data', label: 'Data' },
  { slug: 'text', label: 'Text' },
];
