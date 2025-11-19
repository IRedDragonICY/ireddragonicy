'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { BsChatQuote, BsSend, BsCpu, BsRobot, BsX, BsStopCircle } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'System initialized. How can I assist you with IRedDragonICY\'s portfolio today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      // Optional: Add a visual indicator that it was stopped, but keep it subtle like ChatGPT
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          pathname
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '[ERROR] Neural link failed. Please retry.' }]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Handled in handleStop
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '[ERROR] Connection terminated.' }]);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-lg backdrop-blur-md border transition-all duration-300 group
          ${isOpen 
            ? 'bg-red-500/10 border-red-500/50 text-red-400' 
            : 'bg-black/80 border-cyan-500/30 text-cyan-400 hover:border-cyan-400/60 hover:shadow-cyan-500/20'
          }
        `}
        title={isOpen ? "Close Terminal" : "Open Assistant"}
      >
        <div className="relative">
          {isOpen ? (
             <BsX size={24} className="transition-transform duration-300" />
          ) : (
             <FaBrain size={24} className="group-hover:animate-pulse" />
          )}
          
          {/* Status Dot */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />
          )}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[500px] z-[60] flex flex-col shadow-2xl shadow-black/50"
          >
            {/* Glass Panel */}
            <div className="absolute inset-0 bg-[#030305]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-900/20 overflow-hidden" />
            
            {/* Header */}
            <div className="relative z-10 p-4 border-b border-white/5 bg-gradient-to-r from-cyan-900/20 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                   <BsRobot className="text-cyan-400" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono tracking-wide">NEURAL_ASSISTANT</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>ONLINE • {pathname}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-700">
                <BsCpu /> v1.0.4
              </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm font-light leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-100 rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
                      }
                    `}
                  >
                    {msg.role === 'assistant' && (
                      <div className="text-[9px] font-mono text-cyan-600 mb-1 uppercase">
                        System_Response
                      </div>
                    )}
                    <div className="whitespace-pre-wrap prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 prose-headings:text-cyan-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg rounded-bl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 border-t border-white/5 bg-black/20">
              <form onSubmit={handleSubmit} className="relative flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter query..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all font-mono"
                />
                {isLoading ? (
                   <button
                     type="button"
                     onClick={handleStop}
                     className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-white transition-colors"
                     title="Stop generating"
                   >
                     <BsStopCircle size={18} />
                   </button>
                ) : (
                   <button
                     type="submit"
                     disabled={!input.trim()}
                     className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <BsSend size={18} />
                   </button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

