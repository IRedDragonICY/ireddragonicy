import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';

interface AssetViewerProps {
  item: {
    id: string;
    href: string;
    thumb: string | null;
    title: string | null;
    alt: string | null;
  };
  onClose: () => void;
}

export const AssetViewer: React.FC<AssetViewerProps> = ({ item, onClose }) => {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const onMouseUp = () => setIsDragging(false);

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') handleZoom(0.2);
      if (e.key === '-') handleZoom(-0.2);
      if (e.key === '0') resetView();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      {/* Background (Click to close) */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose}>
         {/* Grid Pattern */}
         <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Top Bar: HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-20">
        <div className="pointer-events-auto flex flex-col">
           <div className="flex items-center gap-3 mb-1">
               <div className="h-2 w-2 bg-cyan-500 rounded-full animate-pulse" />
               <span className="font-mono text-xs text-cyan-400 tracking-widest">VIEWER_ACTIVE</span>
           </div>
           <h2 className="text-xl font-bold text-foreground">{item.title || 'Untitled Asset'}</h2>
           <span className="font-mono text-xs text-muted-foreground">ID: {item.id}</span>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto p-3 rounded-xl bg-muted/20 hover:bg-red-500/20 border border-card-border hover:border-red-500/50 text-muted-foreground hover:text-red-400 transition-all group"
        >
          <FaTimes size={20} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Main Viewport */}
      <div 
        className="relative w-full h-full overflow-hidden cursor-grab active:cursor-grabbing z-10"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/pixiv-img?src=${encodeURIComponent(item.thumb || '')}`}
          alt={item.title || ''}
          className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none shadow-2xl shadow-cyan-500/10"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
          draggable={false}
        />
      </div>

      {/* Bottom Bar: Controls */}
      <div className="absolute bottom-8 inset-x-0 flex justify-center pointer-events-none z-20">
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-card-border shadow-2xl shadow-black/10">
          <ControlBtn onClick={() => handleZoom(-0.2)} icon={FaSearchMinus} label="Zoom Out" />
          <ControlBtn onClick={resetView} icon={FaUndo} label="Reset" />
          <span className="px-2 font-mono text-xs text-cyan-400 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <ControlBtn onClick={() => handleZoom(0.2)} icon={FaSearchPlus} label="Zoom In" />
          
          <div className="w-px h-6 bg-card-border mx-1" />
          
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl text-muted-foreground hover:text-cyan-400 hover:bg-muted/20 transition-colors"
            title="Open Source"
          >
            <FaExternalLinkAlt size={14} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

import { FaExternalLinkAlt } from 'react-icons/fa';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ControlBtn = ({ onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
    title={label}
  >
    <Icon size={14} />
  </button>
);

