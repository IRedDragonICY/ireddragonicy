import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaDatabase, FaSync, FaLayerGroup, FaNetworkWired } from 'react-icons/fa';
import { BsCpuFill } from 'react-icons/bs';

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
  const [systemLoad, setSystemLoad] = useState(42);

  // Simulate fluctuating system load
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemLoad(prev => Math.min(99, Math.max(10, prev + (Math.random() * 10 - 5))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12 space-y-8">
      {/* Title Section with HUD Header */}
      <div className="relative">
        {/* Decorative Top Border */}
        <div className="absolute -top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute -top-8 left-1/4 w-px h-4 bg-cyan-500/30" />
        <div className="absolute -top-8 right-1/4 w-px h-4 bg-cyan-500/30" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <div className="h-px w-12 bg-cyan-500/50" />
              <span className="text-xs font-mono text-cyan-400 tracking-[0.2em] animate-pulse">SYSTEM.ASSETS.V2</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase"
            >
              Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Archive</span>
            </motion.h1>
            <p className="text-gray-500 font-mono text-xs mt-2 max-w-md">
              SECURE REPOSITORY FOR GENERATIVE ARTIFACTS. ACCESS LEVEL: UNRESTRICTED.
            </p>
          </div>

          {/* HUD Stats Group */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
             <HUDStat 
                label="TOTAL ASSETS" 
                value={totalAssets.toString()} 
                icon={FaDatabase} 
                delay={0.2} 
                trend="+2.4%" 
             />
             <HUDStat 
                label="VISIBLE" 
                value={loadedCount.toString()} 
                icon={FaLayerGroup} 
                delay={0.3} 
                color="text-purple-400"
             />
             <HUDStat 
                label="SYS LOAD" 
                value={`${Math.round(systemLoad)}%`} 
                icon={BsCpuFill} 
                delay={0.4} 
                color="text-red-400"
                graph
             />
             <HUDStat 
                label="LATENCY" 
                value="24ms" 
                icon={FaNetworkWired} 
                delay={0.5} 
                color="text-green-400"
             />
          </div>
        </div>
      </div>

      {/* Control Bar - Cyberpunk Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative p-1 rounded-2xl bg-[#050507] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group/bar"
      >
        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
        
        <div className="flex flex-col sm:flex-row items-center gap-4 p-3 relative z-10">
          {/* Search Input */}
          <div className="relative flex-grow w-full sm:w-auto group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <FaSearch className="text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={14} />
            </div>
            <input
              type="text"
              value={userId}
              onChange={(e) => onUserIdChange(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white text-sm rounded-xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 block pl-10 p-3 placeholder-gray-600 transition-all outline-none font-mono tracking-wider"
              placeholder="ENTER USER ID ::"
            />
             <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
               <div className="flex items-center gap-2">
                  <span className="hidden sm:block text-[10px] text-gray-600 font-mono border border-white/10 px-1 rounded">UID</span>
               </div>
             </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-full sm:w-auto relative px-8 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-bold transition-all border border-cyan-500/20 hover:border-cyan-500/50 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden uppercase tracking-wide"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <FaSync className={`${loading ? 'animate-spin' : ''} relative z-10`} size={14} />
            <span className="relative z-10 font-mono">{loading ? 'SYNCING...' : 'INIT_SYNC'}</span>
          </button>
        </div>

        {/* Progress Bar (if loading) */}
        {loading && progress && (
          <div className="px-4 pb-4">
            <div className="flex justify-between text-[10px] font-mono text-cyan-400 mb-1">
               <span className="animate-pulse">DOWNLOADING_ASSETS...</span>
               <span>{Math.round((progress.done / progress.total) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                 className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative"
               >
                 <div className="absolute inset-0 bg-white/20 animate-pulse" />
               </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const HUDStat = ({ label, value, icon: Icon, delay, color = "text-cyan-400", trend, graph }: { label: string, value: string, icon: React.ElementType, delay: number, color?: string, trend?: string, graph?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="relative p-3 rounded-lg bg-black/40 border border-white/10 overflow-hidden group hover:border-cyan-500/30 transition-colors"
  >
    <div className="flex justify-between items-start mb-2">
      <Icon size={14} className={`${color} opacity-70`} />
      {trend && <span className="text-[9px] text-green-400 font-mono">{trend}</span>}
    </div>
    
    <div className="relative z-10">
      <div className="text-[9px] font-mono text-gray-500 tracking-wider uppercase mb-0.5">{label}</div>
      <div className="text-xl font-bold text-white font-mono tracking-tight">{value}</div>
    </div>

    {/* Decorative Background Graph */}
    {graph && (
        <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-between px-1 opacity-20 gap-0.5">
            {[...Array(8)].map((_, i) => (
                <motion.div 
                    key={i}
                    className={`w-full bg-current ${color}`}
                    animate={{ height: [Math.random() * 100 + '%', Math.random() * 100 + '%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                />
            ))}
        </div>
    )}

    {/* Corner accent */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 group-hover:border-cyan-500/50 transition-colors" />
  </motion.div>
);
