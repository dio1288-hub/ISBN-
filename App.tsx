
import React, { useState, useEffect, useCallback } from 'react';
import { fetchBookByISBN } from './geminiService';
import { BookInfo, Language, SearchHistory } from './types';

// Simple Lucide-style SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
);

const App: React.FC = () => {
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [result, setResult] = useState<BookInfo | null>(null);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('isbn_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('isbn_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isbn.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchBookByISBN(isbn.trim(), language);
      setResult(data);
      
      const newHistoryItem: SearchHistory = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data,
        language
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('isbn_history');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 font-sans">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 text-white rounded-2xl mb-4 shadow-lg shadow-indigo-200">
          <BookIcon />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">ISBN 引用生成器</h1>
        <p className="text-slate-500 max-w-lg mx-auto">输入图书 ISBN 编号，自动生成符合规范的引用格式。</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="输入 ISBN (例如: 9787111544296)"
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-lg"
                  />
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setLanguage('zh-CN')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'zh-CN' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    简体
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('zh-TW')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === 'zh-TW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    繁體
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !isbn}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    查询中...
                  </>
                ) : '立即生成'}
              </button>
            </form>
          </section>

          {/* Result Section */}
          {(result || error) && (
            <section className={`p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${error ? 'bg-red-50 border border-red-100' : 'bg-white shadow-sm border border-slate-100'}`}>
              {error ? (
                <div className="text-red-600 text-center py-4">
                  <p className="font-medium">查询失败</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              ) : result && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-800">生成结果</h2>
                    <button
                      onClick={() => copyToClipboard(result.formatted)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <CopyIcon />
                      {copied ? '已复制' : '复制引用'}
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 select-all font-mono text-lg break-all">
                    {result.formatted}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="block text-slate-400 mb-1">作者</span>
                      <span className="text-slate-700 font-medium">{result.author}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="block text-slate-400 mb-1">书名</span>
                      <span className="text-slate-700 font-medium">{result.title}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="block text-slate-400 mb-1">出版地 : 出版社</span>
                      <span className="text-slate-700 font-medium">{result.location} : {result.publisher}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="block text-slate-400 mb-1">年份</span>
                      <span className="text-slate-700 font-medium">{result.year}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar / History Section */}
        <div className="lg:col-span-1">
          <aside className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full max-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <HistoryIcon />
                最近查询
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  清空
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">暂无历史记录</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => {
                      setIsbn(item.data.isbn);
                      setResult(item.data);
                      setLanguage(item.language);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">{item.data.isbn}</span>
                      <span className="text-[10px] text-slate-300">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2 leading-relaxed">
                      {item.data.formatted}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.data.formatted);
                      }}
                      className="text-[10px] text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                    >
                      复制
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} ISBN Citation Tool. Powered by Gemini AI.</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default App;
