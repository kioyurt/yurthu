// src/components/home/GlobalSearch.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Music, Camera, FolderOpen } from "lucide-react";
import { useT } from "@/hooks/useT";
import { useRouter } from "next/navigation";

interface SearchResult {
  title: string;
  type: "article" | "music" | "photo" | "project";
  href: string;
}

// 模拟搜索结果（实际对接搜索 API）
const MOCK_RESULTS: SearchResult[] = [
  { title: "2026年前端趋势：AI驱动开发", type: "article", href: "/articles/1" },
  { title: "用 Rust 重写我的博客引擎", type: "article", href: "/articles/2" },
  { title: "深夜编程歌单", type: "music", href: "/music" },
  { title: "blog-engine", type: "project", href: "/projects/blog-engine" },
];

const TYPE_ICONS = {
  article: FileText,
  music: Music,
  photo: Camera,
  project: FolderOpen,
};

export default function GlobalSearch() {
  const { tr } = useT();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 快捷键 Ctrl/Cmd + K 打开搜索
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // 打开时自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 搜索逻辑
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const filtered = MOCK_RESULTS.filter((r) =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {/* 触发按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-500 hover:text-indigo-500 transition-colors w-full max-w-xs"
      >
        <Search size={15} />
        <span>{tr("搜索文章、音乐、项目...")}</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400">
          ⌘K
        </kbd>
      </motion.button>

      {/* 搜索弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              ref={containerRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* 输入框 */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                <Search size={18} className="text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={tr("搜索...")}
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              {/* 搜索结果 */}
              <div className="max-h-80 overflow-y-auto p-2">
                {query && results.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-8">
                    {tr("没有找到相关内容")} 🔍
                  </p>
                )}
                {results.map((r) => {
                  const Icon = TYPE_ICONS[r.type];
                  return (
                    <button
                      key={r.href}
                      onClick={() => handleSelect(r.href)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors text-left"
                    >
                      <Icon size={16} className="text-indigo-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{r.title}</span>
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400">
                        {r.type}
                      </span>
                    </button>
                  );
                })}
                {!query && (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    {tr("输入关键词搜索，或按")} <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">Esc</kbd> {tr("关闭")}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}