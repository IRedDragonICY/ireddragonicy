import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaSync } from 'react-icons/fa';

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
          >
            Gallery
          </motion.h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            Browse and view artwork from Pixiv. Enter a user ID to load their gallery.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-medium text-foreground">{totalAssets}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Loaded</p>
            <p className="text-2xl font-medium text-foreground">{loadedCount}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        {/* Search Input */}
        <div className="relative flex-grow w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <FaSearch className="text-muted-foreground" size={14} />
          </div>
          <input
            type="text"
            value={userId}
            onChange={(e) => onUserIdChange(e.target.value)}
            className="w-full bg-card border border-card-border text-foreground text-sm rounded-lg focus:border-foreground/30 block pl-10 p-3 placeholder-muted-foreground transition-all outline-none"
            placeholder="Enter Pixiv User ID"
          />
        </div>

        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium transition-all hover:bg-foreground/90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSync className={loading ? 'animate-spin' : ''} size={14} />
          <span>{loading ? 'Loading...' : 'Load Gallery'}</span>
        </button>
      </motion.div>

      {/* Progress Bar */}
      {loading && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Loading assets...</span>
            <span>{Math.round((progress.done / progress.total) * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-muted/30 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(progress.done / progress.total) * 100}%` }}
              className="h-full bg-foreground/70 rounded-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
