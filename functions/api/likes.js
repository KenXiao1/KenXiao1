import { createClient } from '@supabase/supabase-js';

// Use environment variables
const supabaseUrl = 'https://quqdyktxflwyyycltckz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cWR5a3R4Zmx3eXl5Y2x0Y2t6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NzM0MDksImV4cCI6MjA4MDE0OTQwOX0.0sGBQP69qdq6HAkMtK0cXrSy0240zHF9XxsRhy0IoMo';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const contentType = searchParams.get('contentType');
  const contentId = searchParams.get('contentId');

  if (!contentType || !contentId) {
    return new Response(JSON.stringify({ error: 'Missing contentType or contentId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase.rpc('get_likes_count', {
      p_content_type: contentType,
      p_content_id: contentId,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ count: data || 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting likes:', error);
    return new Response(JSON.stringify({ error: 'Failed to get likes count' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPost(context) {
  const { searchParams } = new URL(context.request.url);
  const contentType = searchParams.get('contentType');
  const contentId = searchParams.get('contentId');

  if (!contentType || !contentId) {
    return new Response(JSON.stringify({ error: 'Missing contentType or contentId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data, error } = await supabase.rpc('increment_likes', {
      p_content_type: contentType,
      p_content_id: contentId,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ count: data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
    return new Response(JSON.stringify({ error: 'Failed to increment likes' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
