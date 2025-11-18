'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Mock data for visual effect
const donors = [
  { name: 'Anonymous', tier: 'Gold', hash: '0x8f...2a', amount: 'High' },
  { name: 'DevFan_01', tier: 'Silver', hash: '0x4b...9c', amount: 'Mid' },
  { name: 'AI_Researcher', tier: 'Platinum', hash: '0x1d...ff', amount: 'Max' },
  { name: 'Student_X', tier: 'Bronze', hash: '0x9a...11', amount: 'Low' },
  { name: 'GPU_Lover', tier: 'Silver', hash: '0x3c...4b', amount: 'Mid' },
];

interface Donor {
  name: string;
  tier: string;
  hash: string;
  amount: string;
}

const DonorNode = ({ donor, index }: { donor: Donor; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
    >
      <div className={`w-2 h-2 rounded-full ${
        donor.tier === 'Platinum' ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' :
        donor.tier === 'Gold' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' :
        'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
      }`} />
      <div className="flex-grow">
        <div className="text-xs font-bold text-gray-300">{donor.name}</div>
        <div className="text-[10px] font-mono text-gray-600">{donor.hash}</div>
      </div>
      <div className="text-[10px] font-mono text-cyan-700/50 bg-cyan-900/10 px-2 py-1 rounded">
        NODE_{index + 1}
      </div>
    </motion.div>
  );
};

export default function DonorNetwork() {
  return (
    <div className="w-full py-12 border-t border-white/5 mt-12">
       <div className="max-w-6xl mx-auto px-4">
         <div className="flex items-center gap-4 mb-8">
            <h3 className="text-lg font-bold text-white">Active Research Nodes</h3>
            <div className="h-px flex-grow bg-white/10" />
            <span className="text-xs font-mono text-gray-500">RECENT_CONTRIBUTORS</span>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {donors.map((donor, i) => (
              <DonorNode key={i} donor={donor} index={i} />
            ))}
            <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-white/10 text-xs text-gray-600 font-mono cursor-pointer hover:text-cyan-400 hover:border-cyan-500/30 transition-colors">
               + BECOME_A_NODE
            </div>
         </div>
         
         <p className="text-center text-gray-600 text-xs mt-8 font-mono">
            * All nodes verified on the blockchain (just kidding, but we appreciate you).
         </p>
       </div>
    </div>
  );
}

