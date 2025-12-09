# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (outputs to dist/)
npm run preview  # Preview production build locally
```

## Tech Stack

- **Framework**: Astro 5.x with static output, deployed to Netlify (primary) and Cloudflare Pages (secondary)
- **Deployment Priority**: Netlify is the primary deployment target. Focus on Netlify compatibility. Cloudflare Pages is a backup and may not have all features working.
- **Styling**: Tailwind CSS with `@tailwindcss/typography` plugin
- **CMS**: Keystatic (local storage mode) - access at `/keystatic`. **DO NOT remove or modify Keystatic integration.**
- **React**: Used for interactive components (React 19)
- **Math**: KaTeX for LaTeX rendering via `remark-math` and `rehype-katex`
- **Images**: Cloudinary for photo storage
- **Database**: Supabase for likes functionality (Netlify only)
- **API**: Netlify Functions for serverless endpoints

## Project File Structure (Parent Directory: `D:\KenXiao1 blog`)

This repository (`KenXiao1-KenXiao1`) sits within a larger workspace containing blog assets:

```
D:\KenXiao1 blog\
├── KenXiao1-KenXiao1/              # This repo (linked to GitHub)
├── blog obsidian/                   # Obsidian vault for writing blog posts
│   └── *.md, *.png                  # Draft posts and images (Obsidian syntax)
├── blog photo others/               # Photos to upload to Cloudinary
│   └── 新疆/, 深圳/, 武汉/, etc.
├── personal blog - pdf/             # PDFs to copy to public/pdfs/
│   └── math club linear algebra notes/
├── personal blog - about me.txt     # About page draft content
├── MicrosoftEdge-Surf/              # Source for arcade surf game
└── recommend - some are read.../    # Reading list source materials
    ├── history/                     # History PDFs/EPUBs
    ├── literature/                  # Literature files
    │   └── 徐訏小说选txt/           # TXT novels for online reading
    └── other/                       # Math/science books
```

### Content Flow
1. **Blog posts**: Write in `blog obsidian/` → Copy to `src/content/blog/`
2. **Blog images**: From Obsidian → Copy to `public/images/posts/`
3. **Photos**: From `blog photo others/` → Upload to Cloudinary → Create JSON in `src/content/photos/`
4. **PDFs**: From `personal blog - pdf/` → Copy to `public/pdfs/` → Create JSON in `src/content/pdfs/`
5. **Reading list**: Generated from `recommend.../` folder via `scripts/generate-reading-list.mjs`

## Architecture

### Content Collections (`src/content/`)
Defined in `src/content/config.ts` using Astro's content collections:
- **blog**: Markdown posts with frontmatter (title, date, category, tags, draft, mathjax)
- **photos**: JSON metadata for Cloudinary images, organized by album (stickers-on-desks, others)
- **pdfs**: JSON metadata pointing to files in `public/pdfs/`
- **recommendations**: Reading list items (history, literature, other)
- **friends**: Friend link data for about page

### Key Custom Code
- `src/lib/remark-obsidian-images.mjs`: Remark plugin that converts Obsidian-style `![[image.png]]` syntax to standard markdown images pointing to `/images/posts/`
- `src/lib/supabase.ts`: Supabase client configuration and helper functions for likes functionality
- `src/components/BackgroundEffect.astro`: Interactive Cellular Automata and Turbulence visual effects
- `src/components/EquationModal.astro`: Modal for rendering LaTeX equations
- `src/components/LikeButton.tsx`: React component for like button with localStorage tracking

### Layout System
- `src/layouts/BaseLayout.astro`: Main layout with dark mode support, header, footer, and code block copy buttons
- Dark mode uses `class` strategy, persisted to localStorage

### Keystatic CMS
Configuration in `keystatic.config.tsx` mirrors the content collections:
- **posts**: Blog posts at `src/content/blog/*`
- **photos**: Photography at `src/content/photos/*`
- **pdfs**: PDF documents at `src/content/pdfs/*`
- **recommendations**: Reading list at `src/content/recommendations/*`
- **friends**: Friend links at `src/content/friends/*`

Blog post images are stored in `public/images/posts/`.

### Friend Link System
- Data stored in `src/content/friends/*.json`
- Displayed on `/about` page
- Application via GitHub Issue template: `https://github.com/KenXiao1/KenXiao1/issues/new?template=friend-link.yml`

## Environment Variables

Required in `.env`:
```
# Cloudinary
PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PUBLIC_WEBP_SE_PROXY=your_webp_proxy_url

# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Endpoints

### Likes API
- **GET** `/api/likes?contentType={blog|photo}&contentId={id}` - Get likes count
- **POST** `/api/likes?contentType={blog|photo}&contentId={id}` - Increment likes

Implementation:
- Netlify: `netlify/functions/likes.js`
- Cloudflare Pages: `functions/api/likes.js`
- Both platforms share the same Supabase backend

## Scripts (`scripts/`)

- `upload-photos.mjs`: Sync local photos to Cloudinary (from `blog photo others/`)
- `upload-photos-others.mjs`: Upload photos to "others" album
- `migrate-content.mjs`: Content migration utilities
- `generate-reading-list.mjs`: Generate reading list JSON from `recommend.../` folder
  - Reads folder structure and file names
  - Includes full text content for TXT files in literature (for online reading)
  - Output: `public/reading-list.json`
- `revert-to-cloudinary.mjs`: Revert photo storage to Cloudinary

## Obsidian Integration

The blog supports Obsidian-style image syntax `![[image.png]]` via custom remark plugin.
When copying posts from Obsidian vault:
1. Copy `.md` file to `src/content/blog/`
2. Copy any referenced images to `public/images/posts/`
3. Add frontmatter if missing (or use Keystatic to edit)
