import { useState, useEffect, useRef } from 'react';

interface PDFThumbnailProps {
  filename: string;
  title: string;
}

export default function PDFThumbnail({ filename, title }: PDFThumbnailProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfUrl = `/pdfs/${encodeURIComponent(filename)}`;

  // Use Intersection Observer to lazy load iframes only when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Fallback timer - show icon if iframe doesn't load in time
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden group-hover:from-gray-200 group-hover:to-gray-300 dark:group-hover:from-gray-700 dark:group-hover:to-gray-800 transition-all duration-300"
    >
      {isVisible && !showFallback && (
        <iframe
          src={`${pdfUrl}#page=1&view=FitH&toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full pointer-events-none scale-[1.02] origin-top opacity-90"
          title={`Preview of ${title}`}
          onError={() => setShowFallback(true)}
        />
      )}

      {(!isVisible || showFallback) && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6"></path>
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">PDF</p>
          </div>
        </div>
      )}

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
