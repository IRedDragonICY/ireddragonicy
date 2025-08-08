'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

type AttentionMatrixProps = {
  tokens?: string[];
  size?: number;
  className?: string;
};

/**
 * Animated, interactive attention matrix (Transformer-style) rendered on a canvas.
 * - Highlights attention around the hovered token index
 * - Subtle temporal animation to feel alive
 */
const AttentionMatrix: React.FC<AttentionMatrixProps> = ({
  tokens,
  size = 12,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 640, height: 360 });

  const effectiveTokens = useMemo(() => {
    if (tokens && tokens.length >= 2) return tokens.slice(0, Math.min(tokens.length, size));
    const fallback = [
      '<s>', 'Support', 'the', 'Transformer', 'research', 'with', 'your', 'donation', 'to', 'power', 'open', 'science',
    ];
    return fallback.slice(0, size);
  }, [tokens, size]);

  useEffect(() => {
    const handleResize = () => {
      const parent = canvasRef.current?.parentElement;
      const width = parent ? parent.clientWidth : 640;
      const height = Math.max(260, Math.min(480, Math.round(width * 0.45)));
      setDimensions({ width, height });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = effectiveTokens.length;
    const paddingLeft = 100; // y-axis labels
    const paddingTop = 40; // x-axis labels
    const gridW = Math.max(120, dimensions.width - paddingLeft - 16);
    const gridH = Math.max(120, dimensions.height - paddingTop - 16);
    const cellW = gridW / n;
    const cellH = gridH / n;

    let t = 0;
    const sigma = Math.max(1.2, n / 8);

    const heatColor = (v: number) => {
      // v in [0,1]
      const c1 = { r: 6, g: 182, b: 212 }; // cyan
      const c2 = { r: 139, g: 92, b: 246 }; // violet
      const r = Math.round(c1.r * (1 - v) + c2.r * v);
      const g = Math.round(c1.g * (1 - v) + c2.g * v);
      const b = Math.round(c1.b * (1 - v) + c2.b * v);
      return `rgba(${r}, ${g}, ${b}, ${0.9})`;
    };

    const draw = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, 'rgba(8, 47, 73, 0.3)');
      bgGrad.addColorStop(1, 'rgba(30, 27, 75, 0.3)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // axes labels
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
      for (let i = 0; i < n; i++) {
        const x = paddingLeft + i * cellW + cellW / 2;
        const y = paddingTop / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 10);
        ctx.fillText(effectiveTokens[i] ?? '', 0, 0);
        ctx.restore();
      }
      for (let i = 0; i < n; i++) {
        const x = paddingLeft / 2;
        const y = paddingTop + i * cellH + cellH / 2;
        ctx.fillText(effectiveTokens[i] ?? '', x, y);
      }

      // matrix
      const focus = hoverIndex ?? Math.floor(((Math.sin(t * 0.001) + 1) / 2) * (n - 1));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const dx = i - focus;
          const dy = j - focus;
          const dist2 = dx * dx + dy * dy;
          const base = 0.1 + 0.1 * Math.sin(0.003 * t + (i * 0.7) + (j * 0.4));
          const peak = Math.exp(-dist2 / (2 * sigma * sigma));
          const v = Math.max(0, Math.min(1, base + 0.9 * peak));
          const x = paddingLeft + j * cellW;
          const y = paddingTop + i * cellH;
          ctx.fillStyle = heatColor(v);
          ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        }
      }

      // grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= n; i++) {
        const y = paddingTop + i * cellH;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(paddingLeft + gridW, y);
        ctx.stroke();
      }
      for (let j = 0; j <= n; j++) {
        const x = paddingLeft + j * cellW;
        ctx.beginPath();
        ctx.moveTo(x, paddingTop);
        ctx.lineTo(x, paddingTop + gridH);
        ctx.stroke();
      }

      // focus crosshair
      if (Number.isInteger(focus)) {
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
        ctx.lineWidth = 2;
        const fx = paddingLeft + (focus + 0.5) * cellW;
        const fy = paddingTop + (focus + 0.5) * cellH;
        ctx.beginPath();
        ctx.arc(fx, fy, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }

      t += 16;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, effectiveTokens, hoverIndex]);

  const handleMouseMove: React.MouseEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const n = effectiveTokens.length;
    const paddingLeft = 100;
    const paddingTop = 40;
    const gridW = Math.max(120, dimensions.width - paddingLeft - 16);
    const gridH = Math.max(120, dimensions.height - paddingTop - 16);
    const cellW = gridW / n;
    const cellH = gridH / n;

    if (x >= paddingLeft && x <= paddingLeft + gridW && y >= paddingTop && y <= paddingTop + gridH) {
      const col = Math.floor((x - paddingLeft) / cellW);
      const row = Math.floor((y - paddingTop) / cellH);
      // Use average of row/col to feel smoother
      setHoverIndex(Math.round((row + col) / 2));
    } else {
      setHoverIndex(null);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-auto rounded-xl border border-cyan-400/20 bg-black/40 backdrop-blur-xl"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      />
    </div>
  );
};

export default AttentionMatrix;


