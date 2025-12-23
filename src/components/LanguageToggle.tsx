import { useState, useEffect } from 'react';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const [showBilingual, setShowBilingual] = useState(true);

  useEffect(() => {
    // Load preference from localStorage
    const saved = localStorage.getItem('showBilingual');
    if (saved !== null) {
      setShowBilingual(saved === 'true');
    }
    // Default is true (bilingual mode)

    // Apply initial state
    document.documentElement.setAttribute('data-bilingual', saved !== null ? saved : 'true');
  }, []);

  const toggleLanguage = () => {
    const newValue = !showBilingual;
    setShowBilingual(newValue);
    localStorage.setItem('showBilingual', String(newValue));
    document.documentElement.setAttribute('data-bilingual', String(newValue));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('languageToggle', { detail: { showBilingual: newValue } }));
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`px-3 py-1 text-sm font-mono rounded-md transition-colors
        ${showBilingual
          ? 'bg-accent text-white'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
        } ${className}`}
      title={showBilingual ? 'Click to show Chinese only' : 'Click to show bilingual'}
    >
      {showBilingual ? 'en' : 'cn'}
    </button>
  );
}
