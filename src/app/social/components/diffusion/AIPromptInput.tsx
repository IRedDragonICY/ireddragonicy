'use client';

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AIPromptInput: React.FC<AIPromptInputProps> = ({ value, onChange, placeholder = "Search platforms..." }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto mb-12 relative z-10">
      {/* Input Container */}
      <motion.div 
        initial={false}
        animate={{
          borderColor: isFocused ? 'var(--foreground)' : 'var(--card-border)',
        }}
        transition={{ duration: 0.2 }}
        className="relative bg-card/40 backdrop-blur-xl border border-card-border rounded-xl overflow-hidden"
      >
        <div className="flex items-center px-4 py-3">
          <FaSearch className="text-muted-foreground mr-3" size={14} />
          
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-foreground text-sm placeholder-muted-foreground"
            autoComplete="off"
            spellCheck="false"
          />

          {value && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onChange('')}
              className="ml-2 px-2 py-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs rounded"
            >
              Clear
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIPromptInput;

