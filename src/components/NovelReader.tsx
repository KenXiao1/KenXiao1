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

const themeColors: Record<ThemeColor, {
  bg: string;
  text: string;
  name: string;
  toolbarBg: string;
  buttonBg: string;
  buttonHover: string;
  border: string;
  secondaryText: string;
}> = {
  white: {
    bg: 'bg-white',
    text: 'text-gray-900',
    name: '默认',
    toolbarBg: 'bg-white/95',
    buttonBg: 'bg-gray-100',
    buttonHover: 'hover:bg-gray-200',
    border: 'border-gray-200',
    secondaryText: 'text-gray-500'
  },
  sepia: {
    bg: 'bg-amber-50',
    text: 'text-gray-800',
    name: '护眼',
    toolbarBg: 'bg-amber-50/95',
    buttonBg: 'bg-amber-100',
    buttonHover: 'hover:bg-amber-200',
    border: 'border-amber-200',
    secondaryText: 'text-amber-700'
  },
  night: {
    bg: 'bg-[#1a1a2e]',
    text: 'text-gray-200',
    name: '夜间',
    toolbarBg: 'bg-[#16213e]/95',
    buttonBg: 'bg-[#0f3460]',
    buttonHover: 'hover:bg-[#1a4a7a]',
    border: 'border-[#0f3460]',
    secondaryText: 'text-gray-400'
  },
  green: {
    bg: 'bg-[#c8e6c9]',
    text: 'text-gray-800',
    name: '绿色',
    toolbarBg: 'bg-[#c8e6c9]/95',
    buttonBg: 'bg-[#a5d6a7]',
    buttonHover: 'hover:bg-[#81c784]',
    border: 'border-[#81c784]',
    secondaryText: 'text-green-700'
  }
};

export default function NovelReader({ folder, files }: NovelReaderProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ThemeColor>('sepia');
  const [lineHeight, setLineHeight] = useState(1.8);

  // 从 localStorage 加载设置
  useEffect(() => {
    const savedFontSize = localStorage.getItem('reader-font-size');
    const savedTheme = localStorage.getItem('reader-theme');
    const savedLineHeight = localStorage.getItem('reader-line-height');

    if (savedFontSize) setFontSize(Number(savedFontSize));
    if (savedTheme) setTheme(savedTheme as ThemeColor);
    if (savedLineHeight) setLineHeight(Number(savedLineHeight));
  }, []);

  // 保存设置到 localStorage
  useEffect(() => {
    localStorage.setItem('reader-font-size', fontSize.toString());
    localStorage.setItem('reader-theme', theme);
    localStorage.setItem('reader-line-height', lineHeight.toString());
  }, [fontSize, theme, lineHeight]);

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

  const currentFile = files[currentFileIndex];
  const t = themeColors[theme];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${t.bg} ${t.text}`}>
      {/* 顶部工具栏 */}
      <div className={`sticky top-0 z-50 ${t.toolbarBg} backdrop-blur-md border-b ${t.border} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 左侧：目录和返回 */}
            <div className="flex items-center gap-3">
              <a
                href="/recommendations"
                className={`px-3 py-1.5 text-sm font-medium ${t.buttonBg} ${t.buttonHover} rounded-lg transition-colors`}
              >
                ← 返回
              </a>
              <button
                onClick={() => setShowToc(!showToc)}
                className={`px-3 py-1.5 text-sm font-medium ${t.buttonBg} ${t.buttonHover} rounded-lg transition-colors`}
              >
                {showToc ? '关闭目录' : '目录'}
              </button>
              <h2 className="text-base font-bold hidden sm:block truncate max-w-[200px]">
                {currentFile?.name}
              </h2>
            </div>

            {/* 右侧：控制按钮组 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 字体大小 */}
              <div className={`flex items-center gap-1 px-2 py-1 ${t.buttonBg} rounded-lg`}>
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className={`w-7 h-7 flex items-center justify-center rounded ${t.buttonHover} font-bold text-sm`}
                >
                  A-
                </button>
                <span className={`text-xs ${t.secondaryText} min-w-[2.5rem] text-center`}>
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className={`w-7 h-7 flex items-center justify-center rounded ${t.buttonHover} font-bold text-sm`}
                >
                  A+
                </button>
              </div>

              {/* 行高 */}
              <div className={`flex items-center gap-1 px-2 py-1 ${t.buttonBg} rounded-lg hidden sm:flex`}>
                <button
                  onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.2))}
                  className={`px-2 py-1 text-xs rounded ${t.buttonHover}`}
                >
                  行-
                </button>
                <span className={`text-xs ${t.secondaryText} min-w-[1.5rem] text-center`}>
                  {lineHeight.toFixed(1)}
                </span>
                <button
                  onClick={() => setLineHeight(Math.min(2.5, lineHeight + 0.2))}
                  className={`px-2 py-1 text-xs rounded ${t.buttonHover}`}
                >
                  行+
                </button>
              </div>

              {/* 主题切换 */}
              <div className={`flex gap-1 p-1 ${t.buttonBg} rounded-lg`}>
                {Object.entries(themeColors).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key as ThemeColor)}
                    className={`px-2 py-1 text-xs rounded-md transition-all ${
                      theme === key
                        ? 'bg-purple-600 text-white shadow-md scale-105'
                        : `${t.buttonHover} ${t.text}`
                    }`}
                  >
                    {value.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 目录侧边栏 - 遮罩 */}
      {showToc && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowToc(false)}
        />
      )}

      {/* 目录侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 ${t.bg} border-r ${t.border} shadow-2xl overflow-y-auto transform transition-transform duration-300 ${showToc ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">目录</h3>
            <button
              onClick={() => setShowToc(false)}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${t.buttonBg} ${t.buttonHover}`}
            >
              ✕
            </button>
          </div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFileIndex(index);
                  setShowToc(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  index === currentFileIndex
                    ? 'bg-purple-600 text-white font-medium shadow-md'
                    : `${t.buttonHover} ${t.text}`
                }`}
              >
                <span className={`text-xs ${index === currentFileIndex ? 'text-purple-200' : t.secondaryText} mr-2`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                {file.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center">{currentFile?.name}</h1>
        <article
          className="prose prose-lg max-w-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight
          }}
        >
          {currentFile?.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-4 text-justify" style={{ textIndent: '2em' }}>
                {paragraph.trim()}
              </p>
            ) : (
              <div key={index} className="h-4" />
            )
          ))}
        </article>

        {/* 底部导航 */}
        <div className={`flex justify-between items-center mt-16 pt-8 border-t ${t.border}`}>
          <button
            onClick={handlePrevious}
            disabled={currentFileIndex === 0}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              currentFileIndex === 0
                ? `${t.buttonBg} opacity-50 cursor-not-allowed`
                : `${t.buttonBg} ${t.buttonHover} shadow-md hover:shadow-lg`
            }`}
          >
            ← 上一篇
          </button>
          <div className="text-center">
            <span className={`text-sm ${t.secondaryText}`}>
              {currentFileIndex + 1} / {files.length}
            </span>
          </div>
          <button
            onClick={handleNext}
            disabled={currentFileIndex === files.length - 1}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              currentFileIndex === files.length - 1
                ? `${t.buttonBg} opacity-50 cursor-not-allowed`
                : `${t.buttonBg} ${t.buttonHover} shadow-md hover:shadow-lg`
            }`}
          >
            下一篇 →
          </button>
        </div>
      </div>

      {/* 键盘提示 */}
      <div className={`fixed bottom-4 right-4 ${theme === 'night' ? 'bg-[#0f3460]' : 'bg-gray-800'} text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-75`}>
        ← → 翻页 | ESC 关闭目录
      </div>
    </div>
  );
}
