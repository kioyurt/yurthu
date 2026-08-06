// src/app/ai/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import { Bot, Send, Sparkles, Brain, Search, Zap } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";


interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { icon: Search, label: "搜索文章", prompt: "帮我找关于 React 性能优化的文章" },
  { icon: Sparkles, label: "生成摘要", prompt: "总结我最近写的3篇文章" },
  { icon: Brain, label: "技术问答", prompt: "解释一下 React Server Components" },
  { icon: Zap, label: "代码助手", prompt: "帮我写一个防抖函数" },
];

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是博客 AI 助手 ✨ 可以帮你搜索文章、回答问题、生成摘要。试试下面的快捷操作，或直接输入你的问题吧！" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    // 模拟 AI 响应
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `收到你的问题："${msg}"\n\n这是一个模拟响应。实际部署时，这里会调用你的后端 AI API（如 OpenAI / 本地 LLM）来生成回答。\n\n💡 可以接入：\n• 语义搜索（pgvector）\n• 文章摘要生成\n• 代码解释\n• 智能推荐`,
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24">
      <SectionTitle title="AI 助手" subtitle="智能对话 · 语义搜索 · 知识问答" />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleSend(action.prompt)}
            className="glass glass-hover p-4 text-center group"
          >
            <action.icon className="mx-auto mb-2 text-indigo-500 group-hover:scale-110 transition-transform" size={24} />
            <span className="text-sm font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <GlassCard className="flex flex-col h-[500px] !p-0 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {msg.role === "assistant" ? <Bot size={16} /> : "🧑"}
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                  msg.role === "assistant"
                    ? "bg-gray-50 dark:bg-gray-800/50 rounded-tl-md"
                    : "bg-indigo-500 text-white rounded-tr-md"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-2 h-2 rounded-full bg-indigo-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}


