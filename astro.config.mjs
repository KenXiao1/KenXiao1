import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import { remarkObsidianImages } from './src/lib/remark-obsidian-images.mjs';

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    keystatic(),
    mdx()
  ],
  markdown: {
    remarkPlugins: [remarkMath, remarkObsidianImages],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  output: 'static'
});
