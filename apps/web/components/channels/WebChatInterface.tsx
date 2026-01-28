"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react"; // Start with standard icons
import { motion, AnimatePresence } from "motion/react";
import { marked } from "marked";

interface Message {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export default function WebChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/channels/web/history");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setLoading(true);

    // Optimistic update
    const newMsg: Message = {
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    try {
      const res = await fetch("/api/channels/web/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg }),
      });

      if (!res.ok) {
        throw new Error("Failed to send");
      }

      // Immediate fetch after send
      fetchHistory();
    } catch (error) {
      console.error(error);
      // Ideally revert optimistic update or show error
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950/50 backdrop-blur flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <h2 className="font-semibold text-neutral-200">DeVFlow Interface</h2>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {initialLoad ? (
          <div className="flex justify-center items-center h-full text-neutral-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-center p-8 opacity-60">
            <p>No messages yet.</p>
            <p className="text-sm mt-2">Type /help to get started.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-none"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div
                      className="prose prose-invert prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4"
                      dangerouslySetInnerHTML={{ __html: marked(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}
                  <div
                    className={`text-[10px] mt-1 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
        <div className="relative flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or message..."
            className="w-full bg-neutral-800/50 border-neutral-700 text-neutral-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none min-h-[50px] max-h-[120px]"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-neutral-500">
            Supports Markdown • /help for commands • !devflow for tasks
          </p>
        </div>
      </div>
    </div>
  );
}
