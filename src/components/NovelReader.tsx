import { useState, useEffect } from 'react';

interface NovelReaderProps {
  folder: string;
  files: Array<{ name: string; originalName: string }>;
}

type ThemeColor = 'white' | 'sepia' | 'night' | 'green';

const themeColors: Record<ThemeColor, { bg: string; text: string; name: string }> = {
  white: { bg: 'bg-white', text: 'text-gray-900', name: '默认' },
  sepia: { bg: 'bg-amber-50', text: 'text-gray-800', name: '护眼' },
  night: { bg: 'bg-gray-900', text: 'text-gray-100', name: '夜间' },
  green: { bg: 'bg-green-50', text: 'text-gray-800', name: '绿色' }
};

export default function NovelReader({ folder, files }: NovelReaderProps) {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<ThemeColor>('sepia');
  const [lineHeight, setLineHeight] = useState(1.8);

  // 加载文件内容
  useEffect(() => {
    if (files.length === 0) return;

    const loadFile = async () => {
      setLoading(true);
      try {
        const file = files[currentFileIndex];
        const response = await fetch(
          `/api/read-file?folder=${encodeURIComponent(folder)}&file=${encodeURIComponent(file.originalName)}`
        );
        const data = await response.json();

        if (data.error) {
          setContent(`加载失败: ${data.error}`);
        } else {
          setContent(data.content);
        }
      } catch (error) {
        setContent(`加载失败: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [currentFileIndex, folder, files]);

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

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFileIndex, files.length]);

  const currentFile = files[currentFileIndex];
  const themeClass = themeColors[theme];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClass.bg} ${themeClass.text}`}>
      {/* 顶部工具栏 */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* 标题和目录按钮 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowToc(!showToc)}
                className="px-3 py-1.5 text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
              >
                {showToc ? '关闭目录' : '目录'}
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {currentFile?.name}
              </h2>
            </div>

            {/* 控制按钮组 */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* 字体大小 */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-bold"
                >
                  A-
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem] text-center">
                  {fontSize}px
                </span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-bold"
                >
                  A+
                </button>
              </div>

              {/* 行高 */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                <button
                  onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.2))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                >
                  行高-
                </button>
                <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[2.5rem] text-center">
                  {lineHeight.toFixed(1)}
                </span>
                <button
                  onClick={() => setLineHeight(Math.min(2.5, lineHeight + 0.2))}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm"
                >
                  行高+
                </button>
              </div>

              {/* 主题切换 */}
              <div className="flex gap-1 px-2 py-1.5 bg-gray-100 dark:bg-gray-800 rounded">
                {Object.entries(themeColors).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key as ThemeColor)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      theme === key
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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

      {/* 目录侧边栏 */}
      {showToc && (
        <div className="fixed inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg overflow-y-auto">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">目录</h3>
            <div className="space-y-1">
              {files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentFileIndex(index);
                    setShowToc(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    index === currentFileIndex
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className={`max-w-3xl mx-auto px-6 py-12 ${showToc ? 'ml-80' : ''} transition-all duration-300`}>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-8 text-center">{currentFile?.name}</h1>
            <div
              className="prose prose-lg max-w-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight
              }}
            >
              {content.split('\n').map((paragraph, index) => (
                paragraph.trim() ? (
                  <p key={index} className="mb-4 text-justify indent-8">
                    {paragraph.trim()}
                  </p>
                ) : (
                  <div key={index} className="h-4" />
                )
              ))}
            </div>

            {/* 底部导航 */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handlePrevious}
                disabled={currentFileIndex === 0}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentFileIndex === 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                }`}
              >
                ← 上一篇
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {currentFileIndex + 1} / {files.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentFileIndex === files.length - 1}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentFileIndex === files.length - 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                }`}
              >
                下一篇 →
              </button>
            </div>
          </>
        )}
      </div>

      {/* 键盘提示 */}
      <div className="fixed bottom-4 right-4 bg-gray-800/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm">
        使用 ← → 键翻页
      </div>
    </div>
  );
}
