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
    // Adjust particle count based on screen size for performance
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 30 : 50; 
    const connectionDistance = 150;
    const connectionDistanceSq = connectionDistance * connectionDistance;
    
    let mouseX = -1000;
    let mouseY = -1000;
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      // Cap DPR at 2 for performance on high-res screens
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

    const animate = () => {
      // 1. Clear / Trail Effect
      // Using a slightly lower opacity clear for longer trails but ensure it doesn't smear too much
      ctx.fillStyle = 'rgba(3, 3, 5, 0.25)'; 
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.fillRect(0, 0, w, h);

      // 2. Update Particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        
        // Fast bounding box check for mouse interaction
        if (Math.abs(dx) < 200 && Math.abs(dy) < 200) {
             const distSq = dx * dx + dy * dy;
             if (distSq < 40000) { // 200^2
                const dist = Math.sqrt(distSq);
                // Gentle repulsion
                p.vx -= (dx / dist) * 0.01;
                p.vy -= (dy / dist) * 0.01;
             }
        }
      }

      // 3. Draw Particles (Batched)
      ctx.beginPath();
      ctx.fillStyle = `rgba(34, 211, 238, 0.5)`;
      for (let i = 0; i < particleCount; i++) {
         const p = particles[i];
         ctx.moveTo(p.x + p.size, p.y); 
         ctx.arc(p.x, p.y, p.size, 0, 6.28);
      }
      ctx.fill();

      // 4. Draw Connections
      ctx.lineWidth = 1;
      // We can't easily batch variable alpha lines in 2D canvas without multiple passes
      // But we can optimize the loop
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        for (let j = i + 1; j < particleCount; j++) {
           const p2 = particles[j];
           const dx = p.x - p2.x;
           const dy = p.y - p2.y;
           
           if (dx > connectionDistance || dx < -connectionDistance || dy > connectionDistance || dy < -connectionDistance) continue;

           const distSq = dx * dx + dy * dy;
           if (distSq < connectionDistanceSq) {
             const dist = Math.sqrt(distSq);
             const alpha = 1 - dist / connectionDistance;
             
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
      style={{ willChange: 'transform' }}
      className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-[#030305]"
    />
  );
};

export default DiffusionBackground;
