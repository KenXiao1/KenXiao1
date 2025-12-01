import { useState, useEffect } from 'react';

interface LikeButtonProps {
  contentType: 'blog' | 'photo';
  contentId: string;
  className?: string;
}

export default function LikeButton({ contentType, contentId, className = '' }: LikeButtonProps) {
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const storageKey = `liked_${contentType}_${contentId}`;

  // Load likes count on mount
  useEffect(() => {
    const loadLikes = async () => {
      try {
        const response = await fetch(`/api/likes?contentType=${contentType}&contentId=${contentId}`);
        const data = await response.json();
        setLikes(data.count || 0);

        // Check if user has already liked this content
        const hasLiked = localStorage.getItem(storageKey) === 'true';
        setIsLiked(hasLiked);
      } catch (error) {
        console.error('Error loading likes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLikes();
  }, [contentType, contentId, storageKey]);

  const handleLike = async () => {
    if (isLiked || isLoading) return;

    setIsAnimating(true);

    try {
      const response = await fetch(`/api/likes?contentType=${contentType}&contentId=${contentId}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like');

      const data = await response.json();
      setLikes(data.count);
      setIsLiked(true);
      localStorage.setItem(storageKey, 'true');
    } catch (error) {
      console.error('Error liking content:', error);
      alert('Failed to like. Please try again.');
    } finally {
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLiked || isLoading}
      className={`
        group inline-flex items-center gap-2 px-4 py-2 rounded-full
        transition-all duration-300 font-medium text-sm
        ${isLiked
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-default'
          : 'bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400'
        }
        ${isLoading ? 'opacity-50 cursor-wait' : ''}
        ${className}
      `}
      aria-label={isLiked ? 'Liked' : 'Like this content'}
    >
      <svg
        className={`
          w-5 h-5 transition-all duration-300
          ${isAnimating ? 'scale-125' : 'scale-100'}
          ${isLiked ? 'fill-red-600 dark:fill-red-400' : 'fill-none group-hover:fill-red-200 dark:group-hover:fill-red-900/50'}
        `}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className="tabular-nums">
        {isLoading ? '...' : likes}
      </span>
      {isLiked && (
        <span className="text-xs opacity-70">
          Liked
        </span>
      )}
    </button>
  );
}
