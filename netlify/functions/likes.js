const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const { contentType, contentId } = event.queryStringParameters || {};

    if (!contentType || !contentId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing contentType or contentId' }),
      };
    }

    if (contentType !== 'blog' && contentType !== 'photo' && contentType !== 'pdf') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid contentType. Must be "blog", "photo", or "pdf"' }),
      };
    }

    // GET - Get likes count
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase.rpc('get_likes_count', {
        p_content_type: contentType,
        p_content_id: contentId,
      });

      if (error) {
        console.error('Error getting likes:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to get likes count' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: data || 0 }),
      };
    }

    // POST - Increment likes
    if (event.httpMethod === 'POST') {
      const { data, error } = await supabase.rpc('increment_likes', {
        p_content_type: contentType,
        p_content_id: contentId,
      });

      if (error) {
        console.error('Error incrementing likes:', error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to increment likes' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ count: data }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
