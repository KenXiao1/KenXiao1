import { useState, useEffect, useRef } from 'react';

interface FileWithContent {
  name: string;
  originalName: string;
  content: string;
}

interface NovelReaderProps {
  folder: string;
  files: FileWithContent[];
}

type ThemeColor = 'white' | 'sepia' | 'night' | 'green';
type NightVariant = 'classic' | 'midnight' | 'solarized';
type FontFamily = 'serif' | 'sans';

const themeColors: Record<ThemeColor, {
  bg: string;
  text: string;
  name: string;
  toolbarBg: string;
  buttonBg: string;
  buttonHover: string;
  border: string;
  secondaryText: string;
  accent: string;
  selection: string;
}> = {
  white: {
    bg: 'bg-[#ffffff]',
    text: 'text-gray-800',
    name: 'Default',
    toolbarBg: 'bg-white/80',
    buttonBg: 'bg-gray-100/50',
    buttonHover: 'hover:bg-gray-100',
    border: 'border-gray-200',
    secondaryText: 'text-gray-500',
    accent: 'text-purple-600',
    selection: 'selection:bg-purple-100 selection:text-purple-900'
  },
  sepia: {
    bg: 'bg-[#f6f1e1]',
    text: 'text-[#5f4b32]',
    name: 'Sepia',
    toolbarBg: 'bg-[#f6f1e1]/80',
    buttonBg: 'bg-[#e8e0cc]/50',
    buttonHover: 'hover:bg-[#e8e0cc]',
    border: 'border-[#dcd3bc]',
    secondaryText: 'text-[#8c7b66]',
    accent: 'text-[#8c7b66]',
    selection: 'selection:bg-[#dcd3bc] selection:text-[#5f4b32]'
  },
  night: {
    bg: 'bg-[#1A1A1A]',
    text: 'text-[#D0D0D0]',
    name: 'Night',
    toolbarBg: 'bg-[#1A1A1A]/80',
    buttonBg: 'bg-[#2A2A2A]/50',
    buttonHover: 'hover:bg-[#2A2A2A]',
    border: 'border-[#333333]',
    secondaryText: 'text-[#909090]',
    accent: 'text-[#D0D0D0]',
    selection: 'selection:bg-[#333333] selection:text-[#E0E0E0]'
  },
  green: {
    bg: 'bg-[#e3edcd]',
    text: 'text-[#3d5a40]',
    name: 'Eye Care',
    toolbarBg: 'bg-[#e3edcd]/80',
    buttonBg: 'bg-[#d1e0b5]/50',
    buttonHover: 'hover:bg-[#d1e0b5]',
    border: 'border-[#c2d6a0]',
    secondaryText: 'text-[#6a8a6d]',
    accent: 'text-[#3d5a40]',
    selection: 'selection:bg-[#c2d6a0] selection:text-[#1b3a1e]'
  }
};

const nightVariants: Record<NightVariant, {
  bg: string;
  text: string;
  name: string;
  toolbarBg: string;
  buttonBg: string;
  buttonHover: string;
  border: string;
  secondaryText: string;
  accent: string;
  selection: string;
}> = {
  classic: {
    bg: 'bg-[#1A1A1A]',
    text: 'text-[#D0D0D0]',
    name: 'Classic',
    toolbarBg: 'bg-[#1A1A1A]/80',
    buttonBg: 'bg-[#2A2A2A]/50',
    buttonHover: 'hover:bg-[#2A2A2A]',
    border: 'border-[#333333]',
    secondaryText: 'text-[#909090]',
    accent: 'text-[#D0D0D0]',
    selection: 'selection:bg-[#333333] selection:text-[#E0E0E0]'
  },
  midnight: {
    bg: 'bg-[#0f172a]',
    text: 'text-[#cbd5e1]',
    name: 'Midnight',
    toolbarBg: 'bg-[#0f172a]/80',
    buttonBg: 'bg-[#1e293b]/50',
    buttonHover: 'hover:bg-[#1e293b]',
    border: 'border-[#1e293b]',
    secondaryText: 'text-[#64748b]',
    accent: 'text-[#cbd5e1]',
    selection: 'selection:bg-[#1e293b] selection:text-[#e2e8f0]'
  },
  solarized: {
    bg: 'bg-[#002b36]',
    text: 'text-[#839496]',
    name: 'Solarized',
    toolbarBg: 'bg-[#002b36]/80',
    buttonBg: 'bg-[#073642]/50',
    buttonHover: 'hover:bg-[#073642]',
    border: 'border-[#073642]',
    secondaryText: 'text-[#586e75]',
    accent: 'text-[#2aa198]',
    selection: 'selection:bg-[#073642] selection:text-[#93a1a1]'
  }
};

const fontFamilies: Record<FontFamily, { name: string; class: string }> = {
  serif: { name: 'Serif', class: 'font-serif' },
  sans: { name: 'Sans', class: 'font-sans' }
};

export default function NovelReader({ folder, files }: NovelReaderProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ThemeColor>('sepia');
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [showToolbar, setShowToolbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [nightVariant, setNightVariant] = useState<NightVariant>('classic');
  const [textBrightness, setTextBrightness] = useState(100);
  const [progress, setProgress] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);

  // Load settings
  useEffect(() => {
    const savedFontSize = localStorage.getItem('reader-font-size');
    const savedTheme = localStorage.getItem('reader-theme');
    const savedLineHeight = localStorage.getItem('reader-line-height');
    const savedFontFamily = localStorage.getItem('reader-font-family');
    const savedNightVariant = localStorage.getItem('reader-night-variant');
    const savedTextBrightness = localStorage.getItem('reader-text-brightness');

    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedTheme) setTheme(savedTheme as ThemeColor);
    if (savedLineHeight) setLineHeight(Number(savedLineHeight));
    if (savedFontFamily) setFontFamily(savedFontFamily as FontFamily);
    if (savedNightVariant) setNightVariant(savedNightVariant as NightVariant);
    if (savedTextBrightness) setTextBrightness(Number(savedTextBrightness));
  }, []);

  // Save settings
  useEffect(() => {
    localStorage.setItem('reader-font-size', fontSize.toString());
    localStorage.setItem('reader-theme', theme);
    localStorage.setItem('reader-line-height', lineHeight.toString());
    localStorage.setItem('reader-font-family', fontFamily);
    localStorage.setItem('reader-night-variant', nightVariant);
    localStorage.setItem('reader-text-brightness', textBrightness.toString());
  }, [fontSize, theme, lineHeight, fontFamily, nightVariant, textBrightness]);

  // Scroll handler for toolbar and progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentProgress = totalHeight > 0 ? (currentScrollY / totalHeight) * 100 : 0;

      setProgress(currentProgress);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowToolbar(false);
      } else {
        setShowToolbar(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handlePrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setShowToc(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFileIndex, files.length]);

  const getCurrentTheme = () => {
    if (theme === 'night') {
      return nightVariants[nightVariant];
    }
    return themeColors[theme];
  };

  const getTextColorStyle = () => {
    if (textBrightness === 100) return {};
    const filter = `brightness(${textBrightness / 100})`;
    return { filter };
  };

  const t = getCurrentTheme();
  const currentFile = files[currentFileIndex];

  return (
    <div className={`min-h-screen transition-colors duration-500 ease-in-out ${t.bg} ${t.text} ${t.selection} ${fontFamilies[fontFamily].class}`}>

      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 h-1 z-[60] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, backgroundColor: theme === 'night' ? '#60a5fa' : '#8b5cf6', opacity: showToolbar ? 1 : 0.5 }} />

      {/* Floating Toolbar */}
      <div
        className={`fixed top-6 left-0 right-0 z-50 flex justify-center transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${showToolbar ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'
          }`}
      >
        <div className={`${t.toolbarBg} backdrop-blur-xl border ${t.border} shadow-2xl rounded-2xl px-6 py-3 max-w-5xl w-[95%] sm:w-auto mx-4 transition-colors duration-300`}>
          <div className="flex items-center justify-between gap-6 sm:gap-8">

            {/* Left: Navigation */}
            <div className="flex items-center gap-3">
              <a
                href="/recommendations"
                className={`p-2 rounded-xl transition-all duration-200 ${t.buttonHover} hover:scale-105 active:scale-95`}
                title="Back to List"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
              <button
                onClick={() => setShowToc(!showToc)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${t.buttonBg} ${t.buttonHover} rounded-xl transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Contents</span>
              </button>
              <h2 className="text-sm font-medium opacity-60 hidden md:block truncate max-w-[150px] border-l border-gray-400/20 pl-4">
                {currentFile?.name}
              </h2>
            </div>

            {/* Right: Settings */}
            <div className="flex items-center gap-4">

              {/* Font Controls */}
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${t.buttonHover}`}
                >
                  {fontFamilies[fontFamily].name}
                </button>
                <div className="w-px h-4 bg-gray-400/20"></div>
                <div className="flex items-center">
                  <button
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                    className={`px-2 py-1 ${t.buttonHover} rounded-lg text-sm transition-colors`}
                  >
                    A-
                  </button>
                  <span className="px-2 text-xs font-mono opacity-70 min-w-[2rem] text-center">
                    {fontSize}
                  </span>
                  <button
                    onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                    className={`px-2 py-1 ${t.buttonHover} rounded-lg text-sm transition-colors`}
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Brightness (Desktop) */}
              <div className="hidden lg:flex items-center gap-2 group">
                <svg className="w-4 h-4 opacity-40 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={textBrightness}
                  onChange={(e) => setTextBrightness(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500 hover:accent-gray-700 dark:bg-gray-700"
                />
              </div>

              {/* Theme Toggles */}
              <div className="flex gap-2 items-center pl-2 border-l border-gray-400/20">
                {Object.entries(themeColors).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key as ThemeColor)}
                    className={`w-6 h-6 rounded-full border shadow-sm transition-all duration-200 ${theme === key ? 'scale-125 ring-2 ring-offset-2 ring-purple-400 z-10' : 'hover:scale-110 opacity-70 hover:opacity-100'
                      } ${key === 'white' ? 'bg-white border-gray-200' : ''} 
                      ${key === 'sepia' ? 'bg-[#f6f1e1] border-[#dcd3bc]' : ''}
                      ${key === 'night' ? 'bg-[#1A1A1A] border-[#333333]' : ''}
                      ${key === 'green' ? 'bg-[#e3edcd] border-[#c2d6a0]' : ''}`}
                    title={value.name}
                  />
                ))}

                {theme === 'night' && (
                  <div className="relative group ml-1">
                    <button className={`p-1 rounded-lg ${t.buttonHover}`}>
                      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute top-full right-0 mt-2 py-1 w-32 bg-[#2A2A2A] border border-[#333333] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                      {Object.entries(nightVariants).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => setNightVariant(key as NightVariant)}
                          className={`block w-full text-left px-4 py-2 text-xs ${nightVariant === key ? 'text-blue-400 bg-white/5' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                          {value.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOC Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${showToc ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setShowToc(false)}
      />

      {/* TOC Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] ${t.toolbarBg} backdrop-blur-xl border-r ${t.border} shadow-2xl transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${showToc ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
            <h3 className="text-xl font-serif font-bold tracking-wide">Contents</h3>
            <button
              onClick={() => setShowToc(false)}
              className={`p-2 rounded-full ${t.buttonHover} transition-transform hover:rotate-90 duration-300`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFileIndex(index);
                  setShowToc(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group ${index === currentFileIndex
                    ? `${t.buttonBg} font-medium ${t.accent} shadow-sm ring-1 ring-inset ring-current/10`
                    : `${t.buttonHover} opacity-70 hover:opacity-100`
                  }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs font-mono w-6 text-right opacity-40 group-hover:opacity-70 transition-opacity`}>
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="truncate text-sm leading-relaxed">{file.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="max-w-3xl mx-auto px-6 py-32 sm:py-40 transition-all duration-300 min-h-screen flex flex-col"
        onClick={() => setShowToolbar(!showToolbar)}
      >
        <header className="mb-16 text-center animate-fade-in" style={getTextColorStyle()}>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight tracking-tight">{currentFile?.name}</h1>
          <div className={`h-1 w-24 mx-auto rounded-full opacity-20 ${theme.startsWith('night') ? 'bg-white' : 'bg-black'}`} />
        </header>

        <article
          ref={contentRef}
          className="prose prose-lg sm:prose-xl max-w-none flex-grow"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            ...getTextColorStyle()
          }}
        >
          {currentFile?.content?.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return <div key={index} className="h-4" />;

            return (
              <p
                key={index}
                className={`mb-6 text-justify break-words ${t.text} transition-colors duration-300`}
                style={{
                  textIndent: '2em',
                  color: 'inherit'
                }}
              >
                {trimmed}
              </p>
            );
          })}
        </article>

        {/* Bottom Navigation */}
        <div className={`flex justify-between items-center mt-24 pt-12 border-t ${t.border}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentFileIndex === 0}
            className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${currentFileIndex === 0
                ? 'opacity-30 cursor-not-allowed'
                : `${t.buttonHover} hover:-translate-x-1 shadow-sm border border-transparent hover:border-current/10`
              }`}
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-50 uppercase tracking-wider">Previous</div>
              <div className="font-medium">Chapter</div>
            </div>
          </button>

          <span className={`text-sm opacity-40 font-mono hidden sm:block`}>
            {currentFileIndex + 1} / {files.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentFileIndex === files.length - 1}
            className={`group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 ${currentFileIndex === files.length - 1
                ? 'opacity-30 cursor-not-allowed'
                : `${t.buttonHover} hover:translate-x-1 shadow-sm border border-transparent hover:border-current/10`
              }`}
          >
            <div className="text-right">
              <div className="text-xs opacity-50 uppercase tracking-wider">Next</div>
              <div className="font-medium">Chapter</div>
            </div>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
