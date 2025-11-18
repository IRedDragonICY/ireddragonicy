'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
}

const DiffusionBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Hint to browser that we want to use GPU where possible (mostly for compositor)
    // For 2D context, options are limited but we can ensure we don't read back pixel data
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize: alpha false if opaque background (but we want transparent?) 
    // Actually our design uses fixed inset-0 bg-[#030305] on the canvas container, but we clear with low opacity.
    // So alpha must be true. Let's stick to standard context but optimize the loop.
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    // Reduce particle count slightly for performance safety, though 60 is usually fine.
    const particleCount = 60; 
    const connectionDistance = 150;
    const connectionDistanceSq = connectionDistance * connectionDistance; // Optimization: Avoid sqrt
    
    let mouseX = -1000;
    let mouseY = -1000;
    let lastTime = 0;

    const resize = () => {
      // Handle DPI scaling for crispness (can affect perf, so maybe stick to 1x for heavy effects or detect device)
      const dpr = window.devicePixelRatio || 1;
      // For max performance, maybe ignore DPR or cap it at 2
      const scale = Math.min(dpr, 2);
      
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);
      
      // Style width/height for CSS
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          life: Math.random() * 100
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();

    const animate = (time: number) => {
      const delta = time - lastTime;
      // Cap frame update if needed, but usually requestAnimationFrame handles it.
      lastTime = time;

      // 1. Clear / Trail Effect
      // Using fillRect with opacity is expensive due to read-back-blend-write.
      // Optimization: Use fully opaque clear if trail isn't critical, or use a fading buffer.
      // For "Senior" quality we want trails, but maybe optimized?
      // Let's try strictly additive blending or just standard clear if trails cause lag.
      // Sticking to trail for now but minimizing area if possible (no, full screen).
      ctx.fillStyle = 'rgba(3, 3, 5, 0.2)'; // Slightly faster fade
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillRect(0, 0, w, h);

      // 2. Update Particles
      // Batch drawing: It's hard with varying colors/positions, but we can minimize state changes.
      // Let's group operations.
      
      // Move & Interact
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        // Fast distance check
        if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
             const distSq = dx * dx + dy * dy;
             if (distSq < 40000) { // 200^2
                const dist = Math.sqrt(distSq);
                p.vx -= (dx / dist) * 0.02;
                p.vy -= (dy / dist) * 0.02;
             }
        }
      }

      // 3. Draw Connections (Heaviest part)
      // Optimization: Use a single Path for same-color lines? 
      // They have varying opacity, so we can't batch into one stroke unless we use vertex colors (WebGL).
      // In 2D Canvas, we must issue separate calls or batch by alpha bins.
      // Optimization: Just draw lines. 60*59/2 = 1770 checks.
      // Only draw if close.
      
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Draw particle
        // Optimization: No path begin/close for rects? Arc is nicer.
        ctx.beginPath();
        ctx.fillStyle = `rgba(34, 211, 238, 0.5)`; // Constant alpha is faster than Math.sin
        ctx.arc(p.x, p.y, p.size, 0, 6.28); // 2*PI
        ctx.fill();

        // Connections
        for (let j = i + 1; j < particleCount; j++) {
           const p2 = particles[j];
           const dx = p.x - p2.x;
           const dy = p.y - p2.y;
           
           // Bounding box check first (very fast)
           if (dx > connectionDistance || dx < -connectionDistance || dy > connectionDistance || dy < -connectionDistance) continue;

           const distSq = dx * dx + dy * dy;
           if (distSq < connectionDistanceSq) {
             const dist = Math.sqrt(distSq);
             const alpha = 1 - dist / connectionDistance;
             
             // Threshold alpha to avoid drawing invisible lines
             if (alpha > 0.05) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(139, 92, 246, ${alpha * 0.15})`;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
             }
           }
        }
        
        // Mouse connection
        const mdx = p.x - mouseX;
        const mdy = p.y - mouseY;
        if (Math.abs(mdx) < connectionDistance && Math.abs(mdy) < connectionDistance) {
             const distSq = mdx*mdx + mdy*mdy;
             if (distSq < connectionDistanceSq) {
                const dist = Math.sqrt(distSq);
                const alpha = 1 - dist / connectionDistance;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.2})`;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
             }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Promote to own composite layer with will-change
      style={{ willChange: 'transform' }}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#030305]"
    />
  );
};

export default DiffusionBackground;
