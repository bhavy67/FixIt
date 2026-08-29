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

export const navItems: readonly NavItem[] = [{ label: 'Tools', href: '/tools' }];

export type ToolCategory = {
  slug: 'pdf' | 'image' | 'data' | 'text';
  label: string;
};

export const toolCategories: readonly ToolCategory[] = [
  { slug: 'pdf', label: 'PDF' },
  { slug: 'image', label: 'Images' },
  { slug: 'data', label: 'Data' },
  { slug: 'text', label: 'Text' },
];

export type PopularToolStub = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory['slug'];
};

export const popularTools: readonly PopularToolStub[] = [
  {
    slug: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Make your PDF smaller without losing readability.',
    category: 'pdf',
  },
  {
    slug: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one file.',
    category: 'pdf',
  },
  {
    slug: 'resize-image',
    name: 'Resize Image',
    description: 'Change image dimensions, keep it sharp.',
    category: 'image',
  },
  {
    slug: 'convert-image',
    name: 'Convert Image',
    description: 'JPG, PNG, WebP — switch formats in a click.',
    category: 'image',
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Pretty-print, validate, minify — instantly.',
    category: 'data',
  },
  {
    slug: 'remove-metadata',
    name: 'Remove Metadata',
    description: 'Strip EXIF and hidden data before sharing.',
    category: 'image',
  },
];
