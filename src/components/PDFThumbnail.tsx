import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PDFThumbnailProps {
  filename: string;
  title: string;
}

// Global cache to store generated thumbnails
const thumbnailCache = new Map<string, string>();

export default function PDFThumbnail({ filename, title }: PDFThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(() => {
    // Check cache first
    return thumbnailCache.get(filename) || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfUrl = `/pdfs/${encodeURIComponent(filename)}`;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Load PDF and render thumbnail
  useEffect(() => {
    if (!isVisible || thumbnailUrl || isLoading || hasError) return;

    const generateThumbnail = async () => {
      setIsLoading(true);

      try {
        // Load PDF document
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Get first page
        const page = await pdf.getPage(1);

        // Calculate scale to fit in thumbnail container
        const containerWidth = 300;
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Cache the thumbnail
        thumbnailCache.set(filename, dataUrl);
        setThumbnailUrl(dataUrl);

        // Clean up
        pdf.destroy();
      } catch (error) {
        console.error('Error generating PDF thumbnail:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    generateThumbnail();
  }, [isVisible, thumbnailUrl, isLoading, hasError, pdfUrl, filename]);

  return (
    <div
      ref={containerRef}
      className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden"
    >
      {/* Thumbnail image */}
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={`Preview of ${title}`}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}

      {/* Loading/Fallback state */}
      {!thumbnailUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isLoading ? (
              <>
                <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-accent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
              </>
            ) : (
              <>
                <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6"></path>
                </svg>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDF</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <a
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-sm transition-all duration-300 z-10"
      >
        <div className="text-center transform group-hover:scale-105 transition-transform">
          <svg className="w-12 h-12 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <span className="px-5 py-2.5 bg-white text-black rounded-full text-sm font-bold shadow-lg">
            View PDF
          </span>
        </div>
      </a>
    </div>
  );
}
