import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaDatabase, FaSync, FaLayerGroup } from 'react-icons/fa';

interface AssetDashboardProps {
  userId: string;
  onUserIdChange: (id: string) => void;
  onRefresh: () => void;
  loading: boolean;
  totalAssets: number;
  loadedCount: number;
  progress: { done: number; total: number } | null;
}

export const AssetDashboard: React.FC<AssetDashboardProps> = ({
  userId,
  onUserIdChange,
  onRefresh,
  loading,
  totalAssets,
  loadedCount,
  progress
}) => {
  return (
    <div className="mb-12 space-y-8">
      {/* Title Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="h-px w-12 bg-cyan-500/50" />
            <span className="text-xs font-mono text-cyan-400 tracking-[0.2em]">SYSTEM.ASSETS</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight"
          >
            Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Archive</span>
          </motion.h1>
        </div>

        {/* Stats Group */}
        <div className="flex gap-4 md:gap-8">
           <StatBox label="TOTAL ASSETS" value={totalAssets.toString()} icon={FaDatabase} delay={0.2} />
           <StatBox label="VISIBLE" value={loadedCount.toString()} icon={FaLayerGroup} delay={0.3} />
        </div>
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2 p-2">
          {/* Search Input */}
          <div className="relative flex-grow w-full sm:w-auto group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FaSearch className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={14} />
            </div>
            <input
              type="text"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="w-full bg-black/40 border border-white/5 text-white text-sm rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 block pl-10 p-3 placeholder-gray-600 transition-all outline-none font-mono"
              placeholder="ENTER USER ID..."
            />
             <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
               <span className="text-[10px] text-gray-600 font-mono">UID_TARGET</span>
             </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full sm:w-auto relative px-6 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium transition-all border border-cyan-500/20 hover:border-cyan-500/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
          >
            <div className="absolute inset-0 bg-cyan-400/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <FaSync className={`${loading ? 'animate-spin' : ''} relative z-10`} size={14} />
            <span className="relative z-10 font-mono">{loading ? 'SYNCING...' : 'SYNC DATA'}</span>
          </button>
        </div>

        {/* Progress Bar (if loading) */}
        {loading && progress && (
          <div className="px-3 pb-3 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-1">
               <span>DOWNLOADING_ASSETS...</span>
               <span>{Math.round((progress.done / progress.total) * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                 className="h-full bg-cyan-400"
               />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StatBox = ({ label, value, icon: Icon, delay }: { label: string, value: string, icon: any, delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20 border border-white/5"
  >
    <div className="p-2 rounded-lg bg-white/5 text-gray-400">
      <Icon size={16} />
    </div>
    <div>
      <div className="text-[10px] font-mono text-gray-500 tracking-wider uppercase">{label}</div>
      <div className="text-lg font-bold text-white font-mono">{value}</div>
    </div>
  </motion.div>
);

