import { useState, useEffect } from 'react';

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
    name: '默认',
    toolbarBg: 'bg-white/90',
    buttonBg: 'bg-gray-100',
    buttonHover: 'hover:bg-gray-200',
    border: 'border-gray-200',
    secondaryText: 'text-gray-500',
    accent: 'text-blue-600',
    selection: 'selection:bg-blue-100 selection:text-blue-900'
  },
  sepia: {
    bg: 'bg-[#f6f1e1]',
    text: 'text-[#5f4b32]',
    name: '护眼',
    toolbarBg: 'bg-[#f6f1e1]/90',
    buttonBg: 'bg-[#e8e0cc]',
    buttonHover: 'hover:bg-[#dcd3bc]',
    border: 'border-[#dcd3bc]',
    secondaryText: 'text-[#8c7b66]',
    accent: 'text-[#8c7b66]',
    selection: 'selection:bg-[#dcd3bc] selection:text-[#5f4b32]'
  },
  night: {
    bg: 'bg-[#1A1A1A]',
    text: 'text-[#D0D0D0]',
    name: '夜间',
    toolbarBg: 'bg-[#1A1A1A]/90',
    buttonBg: 'bg-[#2A2A2A]',
    buttonHover: 'hover:bg-[#333333]',
    border: 'border-[#333333]',
    secondaryText: 'text-[#909090]',
    accent: 'text-[#D0D0D0]',
    selection: 'selection:bg-[#333333] selection:text-[#E0E0E0]'
  },
  green: {
    bg: 'bg-[#e3edcd]',
    text: 'text-[#3d5a40]',
    name: '绿色',
    toolbarBg: 'bg-[#e3edcd]/90',
    buttonBg: 'bg-[#d1e0b5]',
    buttonHover: 'hover:bg-[#c2d6a0]',
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
    name: '经典',
    toolbarBg: 'bg-[#1A1A1A]/90',
    buttonBg: 'bg-[#2A2A2A]',
    buttonHover: 'hover:bg-[#333333]',
    border: 'border-[#333333]',
    secondaryText: 'text-[#909090]',
    accent: 'text-[#D0D0D0]',
    selection: 'selection:bg-[#333333] selection:text-[#E0E0E0]'
  },
  midnight: {
    bg: 'bg-[#11161D]',
    text: 'text-[#A0AABB]',
    name: '深海',
    toolbarBg: 'bg-[#11161D]/90',
    buttonBg: 'bg-[#1A2229]',
    buttonHover: 'hover:bg-[#222D36]',
    border: 'border-[#222D36]',
    secondaryText: 'text-[#6A7585]',
    accent: 'text-[#A0AABB]',
    selection: 'selection:bg-[#1A2229] selection:text-[#B0BACC]'
  },
  solarized: {
    bg: 'bg-[#002B36]',
    text: 'text-[#A8B4B6]',
    name: '极客',
    toolbarBg: 'bg-[#002B36]/90',
    buttonBg: 'bg-[#073642]',
    buttonHover: 'hover:bg-[#0D4250]',
    border: 'border-[#073642]',
    secondaryText: 'text-[#708E95]',
    accent: 'text-[#2AA198]',
    selection: 'selection:bg-[#073642] selection:text-[#B8C4C6]'
  }
};

const fontFamilies: Record<FontFamily, { name: string; class: string }> = {
  serif: { name: '宋体', class: 'font-serif' },
  sans: { name: '黑体', class: 'font-sans' }
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
  const [textBrightness, setTextBrightness] = useState(100); // 30-200 范围

  // 从 localStorage 加载设置
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

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem('reader-font-size', fontSize.toString());
    localStorage.setItem('reader-theme', theme);
    localStorage.setItem('reader-line-height', lineHeight.toString());
    localStorage.setItem('reader-font-family', fontFamily);
    localStorage.setItem('reader-night-variant', nightVariant);
    localStorage.setItem('reader-text-brightness', textBrightness.toString());
  }, [fontSize, theme, lineHeight, fontFamily, nightVariant, textBrightness]);

  // 自动隐藏工具栏
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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

  // 获取当前主题颜色(夜间模式应用变体)
  const getCurrentTheme = () => {
    if (theme === 'night') {
      return nightVariants[nightVariant];
    }
    return themeColors[theme];
  };

  // 计算文字颜色的亮度调整
  const getTextColorStyle = () => {
    if (textBrightness === 100) return {};
    const filter = textBrightness > 100
      ? `brightness(${textBrightness / 100})`
      : `brightness(${textBrightness / 100})`;
    return { filter };
  };

  const t = getCurrentTheme();
  const currentFile = files[currentFileIndex];


  return (
    <div className={`min-h-screen transition-colors duration-300 ${t.bg} ${t.text} ${t.selection} ${fontFamilies[fontFamily].class}`}>
      {/* 顶部工具栏 */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${showToolbar ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className={`${t.toolbarBg} backdrop-blur-md border-b ${t.border} shadow-sm`}>
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* 左侧：返回和目录 */}
              <div className="flex items-center gap-2">
                <a
                  href="/recommendations"
                  className={`p-2 rounded-lg transition-colors ${t.buttonHover}`}
                  title="返回"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </a>
                <button
                  onClick={() => setShowToc(!showToc)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium ${t.buttonBg} ${t.buttonHover} rounded-lg transition-colors`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">目录</span>
                </button>
                <h2 className="text-sm font-medium opacity-70 hidden md:block truncate max-w-[200px] ml-2">
                  {currentFile?.name}
                </h2>
              </div>

              {/* 右侧：控制按钮组 */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* 字体设置 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                    className={`px-2 py-1 text-xs rounded border ${t.border} ${t.buttonHover}`}
                  >
                    {fontFamilies[fontFamily].name}
                  </button>
                  <div className={`flex items-center rounded-lg border ${t.border} overflow-hidden`}>
                    <button
                      onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                      className={`px-2 py-1 ${t.buttonHover} text-sm`}
                    >
                      A-
                    </button>
                    <span className={`px-2 text-xs border-l border-r ${t.border} min-w-[2.5rem] text-center`}>
                      {fontSize}
                    </span>
                    <button
                      onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                      className={`px-2 py-1 ${t.buttonHover} text-sm`}
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* 字体亮度调节 */}
                <div className="hidden sm:flex items-center gap-1">
                  <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <input
                    type="range"
                    min="30"
                    max="200"
                    step="10"
                    value={textBrightness}
                    onChange={(e) => setTextBrightness(Number(e.target.value))}
                    className="w-16 h-1 accent-current cursor-pointer"
                    title={`亮度: ${textBrightness}%`}
                  />
                </div>

                {/* 主题切换 */}
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {Object.entries(themeColors).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setTheme(key as ThemeColor)}
                        className={`w-6 h-6 rounded-full border transition-transform ${theme === key ? 'scale-110 ring-2 ring-offset-2 ring-blue-400' : 'hover:scale-105'
                          } ${key === 'white' ? 'bg-white border-gray-300' : ''} 
                          ${key === 'sepia' ? 'bg-[#f6f1e1] border-[#dcd3bc]' : ''}
                          ${key === 'night' ? 'bg-[#1A1A1A] border-[#333333]' : ''}
                          ${key === 'green' ? 'bg-[#e3edcd] border-[#c2d6a0]' : ''}`}
                        title={value.name}
                      />
                    ))}
                  </div>
                  {/* 夜间模式变体选择器 */}
                  {theme === 'night' && (
                    <select
                      value={nightVariant}
                      onChange={(e) => setNightVariant(e.target.value as NightVariant)}
                      className={`text-xs px-2 py-1 rounded border ${t.border} ${t.buttonBg} ${t.buttonHover} cursor-pointer`}
                    >
                      {Object.entries(nightVariants).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 目录侧边栏 - 遮罩 */}
      {showToc && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setShowToc(false)}
        />
      )}

      {/* 目录侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] ${t.bg} border-r ${t.border} shadow-2xl transform transition-transform duration-300 ease-out ${showToc ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b ${t.border} flex items-center justify-between`}>
            <h3 className="text-lg font-bold">目录</h3>
            <button
              onClick={() => setShowToc(false)}
              className={`p-2 rounded-full ${t.buttonHover}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFileIndex(index);
                  setShowToc(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all mb-1 ${index === currentFileIndex
                  ? `${t.buttonBg} font-medium ${t.accent}`
                  : `${t.buttonHover} opacity-80 hover:opacity-100`
                  }`}
              >
                <div className="flex items-baseline gap-3">
                  <span className={`text-xs opacity-50 font-mono w-6 text-right`}>
                    {index + 1}
                  </span>
                  <span className="truncate">{file.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div
        className="max-w-3xl mx-auto px-6 py-20 sm:py-24 transition-all duration-300"
        onClick={() => setShowToolbar(!showToolbar)}
      >
        <header className="mb-12 text-center" style={getTextColorStyle()}>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{currentFile?.name}</h1>
          <div className={`h-1 w-20 mx-auto rounded-full opacity-20 ${theme.startsWith('night') ? 'bg-white' : 'bg-black'}`} />
        </header>

        <article
          className="prose prose-lg max-w-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            ...getTextColorStyle()
          }}
        >
          {currentFile?.content?.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return <div key={index} className="h-6" />;

            return (
              <p
                key={index}
                className={`mb-6 text-justify break-words ${t.text}`}
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

        {/* 底部导航 */}
        <div className={`flex justify-between items-center mt-20 pt-8 border-t ${t.border}`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            disabled={currentFileIndex === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentFileIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : `${t.buttonHover} hover:-translate-x-1`
              }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            上一篇
          </button>

          <span className={`text-sm opacity-50 font-mono`}>
            {currentFileIndex + 1} / {files.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentFileIndex === files.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentFileIndex === files.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : `${t.buttonHover} hover:translate-x-1`
              }`}
          >
            下一篇
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
