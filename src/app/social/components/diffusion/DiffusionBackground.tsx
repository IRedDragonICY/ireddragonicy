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
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 40 : 80; // Increased count for denser, scientific feel
    const connectionDistance = 120; // Shorter, tighter connections
    const connectionDistanceSq = connectionDistance * connectionDistance;
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.min(dpr, 2);
      
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      ctx.scale(scale, scale);
      
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
          vx: (Math.random() - 0.5) * 0.3, // Slower, more stable movement
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5, // Smaller particles
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

    const animate = () => {
      // 1. Clear (Technical Void)
      ctx.fillStyle = '#050505'; 
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw faint grid lines
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      const gridSize = 100;
      for(let x=0; x<window.innerWidth; x+=gridSize) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,window.innerHeight); ctx.stroke(); }
      for(let y=0; y<window.innerHeight; y+=gridSize) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(window.innerWidth,y); ctx.stroke(); }

      // 2. Update Particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        
        // Interaction
        if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
             const distSq = dx * dx + dy * dy;
             if (distSq < 40000) {
                const dist = Math.sqrt(distSq);
                p.vx -= (dx / dist) * 0.005; // Very subtle influence
                p.vy -= (dy / dist) * 0.005;
             }
        }
      }

      // 3. Draw Particles (Monochrome)
      ctx.fillStyle = `rgba(255, 255, 255, 0.5)`; // White/Grey
      for (let i = 0; i < particleCount; i++) {
         const p = particles[i];
         ctx.beginPath();
         ctx.arc(p.x, p.y, p.size, 0, 6.28);
         ctx.fill();
      }

      // 4. Draw Connections (Structural Lines)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        for (let j = i + 1; j < particleCount; j++) {
           const p2 = particles[j];
           const dx = p.x - p2.x;
           const dy = p.y - p2.y;
           
           if (Math.abs(dx) > connectionDistance || Math.abs(dy) > connectionDistance) continue;

           const distSq = dx * dx + dy * dy;
           if (distSq < connectionDistanceSq) {
             const alpha = (1 - Math.sqrt(distSq) / connectionDistance) * 0.15;
             
             if (alpha > 0.01) {
                ctx.beginPath();
                // Very faint white lines
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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
                const alpha = (1 - Math.sqrt(distSq) / connectionDistance) * 0.3;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
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
      style={{ willChange: 'transform' }}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#050505]"
    />
  );
};

export default DiffusionBackground;
