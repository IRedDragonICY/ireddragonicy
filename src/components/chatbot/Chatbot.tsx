'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { BsSend, BsCpu, BsRobot, BsX, BsStopCircle, BsTerminal } from 'react-icons/bs';
import { FaBrain } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

// Typewriter effect component for streaming text
const TypewriterMessage = ({ content, onComplete }: { content: string, onComplete?: () => void }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < content.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // Fast typing speed
      return () => clearTimeout(timeout);
    } else {
      if (onComplete) onComplete();
    }
  }, [currentIndex, content, onComplete]);

  return (
    <div className="whitespace-pre-wrap prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 prose-headings:text-cyan-100 prose-a:text-cyan-400 hover:prose-a:text-cyan-300">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {displayedContent}
      </ReactMarkdown>
      {currentIndex < content.length && (
        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
      )}
    </div>
  );
};

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'System initialized. How can I assist you with IRedDragonICY\'s portfolio today?', id: 'init' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [bootSequence, setBootSequence] = useState(false);

  // Boot sequence effect on open
  useEffect(() => {
    if (isOpen) {
      setBootSequence(true);
      const timer = setTimeout(() => setBootSequence(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, bootSequence]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
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
        setMessages(prev => [...prev, { role: 'assistant', content: '[ERROR] Neural link failed. Please retry.', id: (Date.now() + 1).toString() }]);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setMessages(prev => [...prev, { role: 'assistant', content: '[ERROR] Connection terminated.', id: (Date.now() + 1).toString() }]);
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
             <div className="relative">
                <FaBrain size={24} className="group-hover:animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-black" />
             </div>
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
                    NEURAL_ASSISTANT
                    <span className="text-[8px] px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">BETA</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span>ONLINE • {pathname}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-700">
                <BsCpu className="animate-spin-slow" /> v1.0.4
              </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {bootSequence ? (
                <div className="h-full flex flex-col items-center justify-center text-cyan-500/50 font-mono text-xs space-y-1">
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>&gt; INITIALIZING NEURAL LINK...</motion.div>
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>&gt; LOADING CONTEXT VECTORS...</motion.div>
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>&gt; ESTABLISHING SECURE HANDSHAKE...</motion.div>
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} className="text-green-400">&gt; SYSTEM READY.</motion.div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
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
                            System_Response
                          </div>
                        )}
                        
                        {msg.role === 'assistant' && idx === messages.length - 1 && isLoading ? (
                           // Use typewriter for the very last message if it's still streaming (simulated here by just always using it for assistant)
                           <TypewriterMessage content={msg.content} />
                        ) : msg.role === 'assistant' ? (
                           <TypewriterMessage content={msg.content} />
                        ) : (
                           <div className="whitespace-pre-wrap">{msg.content}</div>
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
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-4 border-t border-white/5 bg-black/40 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="relative flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Input command..."
                  disabled={bootSequence}
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
                     disabled={!input.trim() || bootSequence}
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
