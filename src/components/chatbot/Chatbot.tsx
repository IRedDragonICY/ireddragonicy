'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { BsSend, BsCpu, BsRobot, BsX, BsStopCircle, BsTerminal, BsTrash } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  typed?: boolean;
}

// Custom Markdown Components for "Tab-like" feel
const MarkdownComponents = {
  ul: ({ children }: any) => (
    <div className="flex flex-col gap-2 my-3 pl-0 list-none">
      {children}
    </div>
  ),
  li: ({ children }: any) => (
    <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-cyan-500/30 transition-all group">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/0 group-hover:bg-cyan-500 transition-all" />
      <div className="text-xs text-gray-300 group-hover:text-white transition-colors pl-2">
        {children}
      </div>
    </div>
  ),
  a: ({ href, children }: any) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="text-cyan-400 hover:text-cyan-200 font-medium underline decoration-cyan-500/30 underline-offset-4 hover:decoration-cyan-400 transition-all break-all"
    >
      {children}
    </a>
  ),
  p: ({ children }: any) => (
    <p className="mb-2 last:mb-0 leading-relaxed text-gray-300">
      {children}
    </p>
  ),
  strong: ({ children }: any) => (
    <strong className="text-white font-bold bg-white/10 px-1 rounded">
      {children}
    </strong>
  )
};

// Typewriter effect component for streaming text
const TypewriterMessage = ({ content, shouldAnimate = true, onComplete }: { content: string, shouldAnimate?: boolean, onComplete?: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState(shouldAnimate ? '' : content);
  const [currentIndex, setCurrentIndex] = useState(shouldAnimate ? 0 : content.length);
  
  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
      return;
    }

    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 10); // Slightly faster typing
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, content, onComplete, shouldAnimate]);

  return (
    <div className="whitespace-pre-wrap text-sm">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={MarkdownComponents}
      >
        {displayedContent}
      </ReactMarkdown>
      {currentIndex < content.length && (
        <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
};

export default function Chatbot({ 
  isOpen: externalIsOpen, 
  onToggle: externalOnToggle,
  embedded = false 
}: { 
  isOpen?: boolean; 
  onToggle?: () => void;
  embedded?: boolean;
}) {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlled = typeof externalIsOpen !== 'undefined';
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      externalOnToggle?.();
    } else {
      setInternalIsOpen(val);
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          hasInitialized.current = true;
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
    setIsHistoryLoaded(true);
  }, []);

  // Save history when messages change
  useEffect(() => {
    if (isHistoryLoaded) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages, isHistoryLoaded]);

  // Initial greeting effect on open
  useEffect(() => {
    if (!isHistoryLoaded) return;

    if (isOpen && !hasInitialized.current) {
      hasInitialized.current = true;
      setIsLoading(true);
      
      // Trigger initial AI greeting
      (async () => {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ 
                role: 'user', 
                content: 'Generate a short, cute, and friendly greeting from Vixevia (a programmer girl AI) to a visitor. Use a kaomoji. Keep it under 20 words. Do not use quotes.' 
              }],
              pathname
            }),
          });

          const data = await response.json();
          if (data.content) {
            setMessages([{ role: 'assistant', content: data.content, id: 'init' }]);
          } else {
            setMessages([{ role: 'assistant', content: 'Hi there! Vixevia here, ready to help you explore! (≧◡≦)', id: 'init' }]);
          }
        } catch (_) {
          setMessages([{ role: 'assistant', content: "Vixevia is online! Let's code something cool! (◕‿◕)", id: 'init' }]);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [isOpen, pathname, isHistoryLoaded]);

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
    }
  };

  const handleMessageComplete = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, typed: true } : m));
  };

  const handleReset = () => {
    setMessages([]);
    localStorage.removeItem('chat_history');
    hasInitialized.current = false;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input, id: Date.now().toString() };
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
          messages: messages.concat(userMessage).map(m => ({ role: m.role, content: m.content })),
          pathname
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content, id: (Date.now() + 1).toString() }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Oops! My connection glitched. Can you try again? (＞﹏＜)", id: (Date.now() + 1).toString() }]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost! I can't reach the server. (T_T)", id: (Date.now() + 1).toString() }]);
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
      {/* Toggle Button - Only show if not embedded */}
      {!embedded && (
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
               <div className="relative">
                  <FaBrain size={24} className="group-hover:animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />
               </div>
            )}
          </div>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: embedded ? 'top right' : 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={embedded 
              ? "absolute top-full right-0 mt-4 w-[90vw] sm:w-[380px] h-[500px] z-[60] flex flex-col shadow-2xl shadow-black/50"
              : "fixed bottom-24 right-6 w-[90vw] sm:w-[380px] h-[500px] z-[60] flex flex-col shadow-2xl shadow-black/50"
            }
          >
            {/* Glass Panel */}
            <div className="absolute inset-0 bg-[#030305]/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 shadow-2xl shadow-cyan-900/20 overflow-hidden">
               {/* Scanning Scanline */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,255,255,0)_50%,rgba(0,255,255,0.025)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,6px_100%]" />
               <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent opacity-10" />
            </div>
            
            {/* Header */}
            <div className="relative z-10 p-4 border-b border-white/5 bg-gradient-to-r from-cyan-900/20 to-transparent flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 relative overflow-hidden">
                   <motion.div 
                      className="absolute inset-0 bg-cyan-400/20"
                      animate={{ y: ['100%', '-100%'] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                   />
                   <BsRobot className="text-cyan-400 relative z-10" size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono tracking-wide flex items-center gap-2">
                    Vixevia
                    <span className="text-[8px] px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">BETA</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>ONLINE • {pathname}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-700">
                <button 
                  onClick={handleReset}
                  className="p-1 hover:text-red-400 transition-colors"
                  title="Reset Chat"
                >
                  <BsTrash size={14} />
                </button>
                <BsCpu className="animate-spin-slow" /> v1.0.4
              </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg text-sm font-light leading-relaxed relative group
                      ${msg.role === 'user'
                        ? 'bg-cyan-600/10 border border-cyan-500/30 text-cyan-100 rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-none'
                      }
                    `}
                  >
                    {/* Message Corner Accents */}
                    <div className={`absolute top-0 w-2 h-2 border-t border-cyan-500/30 ${msg.role === 'user' ? 'right-0 border-r rounded-tr' : 'left-0 border-l rounded-tl'}`} />
                    <div className={`absolute bottom-0 w-2 h-2 border-b border-cyan-500/30 ${msg.role === 'user' ? 'left-0 border-l rounded-bl' : 'right-0 border-r rounded-br'}`} />

                    {msg.role === 'assistant' && (
                      <div className="text-[9px] font-mono text-cyan-600 mb-1 uppercase flex items-center gap-2">
                        <BsTerminal size={10} />
                        Vixevia
                      </div>
                    )}
                    
                    {msg.role === 'assistant' ? (
                      <TypewriterMessage 
                        content={msg.content} 
                        shouldAnimate={!msg.typed}
                        onComplete={() => handleMessageComplete(msg.id)}
                      />
                    ) : (
                        <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-lg rounded-bl-none flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.span 
                        className="w-1 h-3 bg-cyan-400" 
                        animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0 }} 
                      />
                      <motion.span 
                        className="w-1 h-3 bg-cyan-400" 
                        animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} 
                      />
                      <motion.span 
                        className="w-1 h-3 bg-cyan-400" 
                        animate={{ scaleY: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} 
                        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-500 animate-pulse">PROCESSING...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="relative flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Input command..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-950/10 transition-all font-mono disabled:opacity-50"
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
                     className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/20 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                   >
                     <BsSend size={18} className="group-hover:translate-x-0.5 transition-transform" />
                   </button>
                )}
              </form>
              <div className="absolute bottom-1 left-4 text-[8px] text-gray-600 font-mono">
                SECURE CONNECTION // END-TO-END ENCRYPTED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
