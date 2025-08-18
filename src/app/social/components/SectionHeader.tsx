import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <div className="relative mb-12">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
    />
    <h1 className="relative text-center text-3xl md:text-5xl font-extrabold tracking-tight">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
        &lt;{title}/&gt;
      </span>
    </h1>
  </div>
);