import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ContentType = 'blog' | 'photo';

export interface LikeData {
  content_type: ContentType;
  content_id: string;
  count: number;
}

/**
 * Increment likes for a piece of content
 */
export async function incrementLikes(contentType: ContentType, contentId: string): Promise<number> {
  const { data, error } = await supabase.rpc('increment_likes', {
    p_content_type: contentType,
    p_content_id: contentId,
  });

  if (error) {
    console.error('Error incrementing likes:', error);
    throw error;
  }

  return data as number;
}

/**
 * Get likes count for a piece of content
 */
export async function getLikesCount(contentType: ContentType, contentId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_likes_count', {
    p_content_type: contentType,
    p_content_id: contentId,
  });

  if (error) {
    console.error('Error getting likes count:', error);
    throw error;
  }

  return data as number;
}

/**
 * Get likes for multiple content items at once
 */
export async function getBatchLikes(
  contentType: ContentType,
  contentIds: string[]
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from('likes')
    .select('content_id, count')
    .eq('content_type', contentType)
    .in('content_id', contentIds);

  if (error) {
    console.error('Error getting batch likes:', error);
    return new Map();
  }

  const likesMap = new Map<string, number>();
  data?.forEach((item) => {
    likesMap.set(item.content_id, item.count);
  });

  return likesMap;
}
