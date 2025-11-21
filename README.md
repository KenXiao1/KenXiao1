# Ken Xiao's Personal Blog

A modern, academic-style personal blog built with Astro, Cloudflare Pages, and Keystatic CMS.

## Features

- **Academic Theme:** Clean, serif-based typography with dark mode support.
- **Visual Effects:** Interactive Cellular Automata and Turbulence backgrounds.
- **Content Management:** Keystatic CMS for online editing.
- **Photography Gallery:** Masonry layout with lightbox, powered by Cloudinary.
- **PDF Library:** Dedicated section for academic papers and documents.
- **Math Support:** LaTeX rendering via KaTeX.

## Getting Started

### Prerequisites

- Node.js 18+
- Cloudinary Account (for photography)
- GitHub Account (for deployment)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Content Management

### Blog Posts
- Add Markdown files to `src/content/blog/`.
- Or access the CMS at `/keystatic` (requires configuration).

### Photography
- Run the upload script to sync photos from your local folder to Cloudinary:
  ```bash
  # Set env vars first
  node scripts/upload-photos.mjs
  ```

### PDFs
- Place PDF files in `public/pdfs/`.
- Add metadata JSON files in `src/content/pdfs/`.

## Deployment

This project is configured for **Cloudflare Pages**.

1. Push to GitHub.
2. Connect your repository in Cloudflare Pages dashboard.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables in Cloudflare dashboard.

## License

All rights reserved.
