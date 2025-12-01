# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
```

## Tech Stack

- **Framework**: Astro 5.x with static output, deployed to Cloudflare Pages
- **Styling**: Tailwind CSS with `@tailwindcss/typography` plugin
- **CMS**: Keystatic (local storage mode) - access at `/keystatic`
- **React**: Used for interactive components (React 19)
- **Math**: KaTeX for LaTeX rendering via `remark-math` and `rehype-katex`
- **Images**: Cloudinary for photo storage

## Architecture

### Content Collections (`src/content/`)
Defined in `src/content/config.ts` using Astro's content collections:
- **blog**: Markdown posts with frontmatter (title, date, category, tags, draft, mathjax)
- **photos**: JSON metadata for Cloudinary images, organized by album
- **pdfs**: JSON metadata pointing to files in `public/pdfs/`
- **recommendations**: Reading list items

### Key Custom Code
- `src/lib/remark-obsidian-images.mjs`: Remark plugin that converts Obsidian-style `![[image.png]]` syntax to standard markdown images pointing to `/images/posts/`
- `src/components/BackgroundEffect.astro`: Interactive Cellular Automata and Turbulence visual effects
- `src/components/EquationModal.astro`: Modal for rendering LaTeX equations

### Layout System
- `src/layouts/BaseLayout.astro`: Main layout with dark mode support, header, footer, and code block copy buttons
- Dark mode uses `class` strategy, persisted to localStorage

### Keystatic CMS
Configuration in `keystatic.config.tsx` mirrors the content collections. Blog post images are stored in `public/images/posts/`.

## Environment Variables

Required in `.env`:
```
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Scripts (`scripts/`)

- `upload-photos.mjs`: Sync local photos to Cloudinary
- `migrate-content.mjs`: Content migration utilities
