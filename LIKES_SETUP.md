# Likes Feature Setup

This document explains how the likes functionality is implemented in the blog.

## Architecture

The likes feature uses:
- **Supabase** - PostgreSQL database for storing likes data
- **Netlify Functions** - API endpoints for Netlify deployment
- **Cloudflare Pages Functions** - API endpoints for Cloudflare deployment
- **React** - LikeButton component for user interaction
- **localStorage** - Track which content the user has already liked

## Database Setup

The likes data is stored in a Supabase table with the following schema:

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'photo')),
  content_id TEXT NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id)
);
```

Two PostgreSQL functions provide atomic operations:
- `increment_likes(content_type, content_id)` - Safely increment likes count
- `get_likes_count(content_type, content_id)` - Retrieve current likes count

## Implementation Details

### 1. Client Component (`src/components/LikeButton.tsx`)
- Fetches initial likes count from API
- Checks localStorage to see if user has already liked
- Handles like button click with animation
- Prevents duplicate likes from same user (via localStorage)

### 2. API Endpoints

Both platforms use the same Supabase backend:

**Netlify**: `netlify/functions/likes.js`
- Standard Node.js serverless function
- Exports a `handler` function

**Cloudflare Pages**: `functions/api/likes.js`
- ES modules with named exports
- Uses `onRequestGet`, `onRequestPost`, `onRequestOptions`

### 3. Integration

**Blog Posts** (`src/pages/blog/[slug].astro`):
```astro
<LikeButton client:load contentType="blog" contentId={post.slug} />
```

**Photos** (`src/components/PhotoGrid.astro`):
- Like buttons are pre-rendered for each photo
- Dynamically shown in lightbox when photo is opened
- Updates when navigating between photos

## Environment Variables

Add to your `.env`:
```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Also configure these in:
- Netlify: Site Settings → Environment Variables
- Cloudflare Pages: Settings → Environment Variables

## Testing Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Test Netlify functions locally (optional):
   ```bash
   netlify dev
   ```

## Security Considerations

- Uses Supabase Row Level Security (RLS) policies
- Anon key is safe to expose (read-only + RLS protection)
- localStorage prevents client-side duplicate likes
- Server-side uses atomic database operations to prevent race conditions

## Future Enhancements

Potential improvements:
- Add IP-based rate limiting
- Show who liked (requires authentication)
- Add unlike functionality
- Display like counts on homepage/gallery thumbnails
- Analytics dashboard for popular content
