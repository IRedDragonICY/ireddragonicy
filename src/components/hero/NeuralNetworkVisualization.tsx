'use client';

import React, { useEffect, useRef } from 'react';

const NeuralNetworkVisualization = React.memo(({ isActive, progress }: { isActive: boolean; progress: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    canvas.width = isMobile ? 150 : 200;
    canvas.height = isMobile ? 150 : 200;

    const drawNetwork = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const layers = isMobile ? 3 : 4;
      const nodesPerLayer = isMobile ? [2, 3, 2] : [3, 5, 5, 3];
      const time = timeRef.current;

      for (let l = 0; l < layers - 1; l++) {
        for (let i = 0; i < nodesPerLayer[l]; i++) {
          for (let j = 0; j < nodesPerLayer[l + 1]; j++) {
            const x1 = (l + 1) * (canvas.width / (layers + 1));
            const y1 = (i + 1) * (canvas.height / (nodesPerLayer[l] + 1));
            const x2 = (l + 2) * (canvas.width / (layers + 1));
            const y2 = (j + 1) * (canvas.height / (nodesPerLayer[l + 1] + 1));

            const activation = (Math.sin(time * 0.002 + i + j + l * 2) + 1) / 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(34, 211, 238, ${activation * 0.3 * progress})`;
            ctx.lineWidth = activation * 1.5;
            ctx.stroke();
          }
        }
      }

      for (let l = 0; l < layers; l++) {
        for (let i = 0; i < nodesPerLayer[l]; i++) {
          const x = (l + 1) * (canvas.width / (layers + 1));
          const y = (i + 1) * (canvas.height / (nodesPerLayer[l] + 1));
          const activation = (Math.sin(time * 0.003 + i + l * 3) + 1) / 2;

          ctx.beginPath();
          ctx.arc(x, y, 3 + activation * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
          gradient.addColorStop(0, `rgba(34, 211, 238, ${0.8 * progress})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${0.3 * progress})`);
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * progress})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      timeRef.current += 16;
      animationRef.current = requestAnimationFrame(drawNetwork);
    };

    drawNetwork();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, progress]);

  return <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'auto' }} />;
});

NeuralNetworkVisualization.displayName = 'NeuralNetworkVisualization';
export default NeuralNetworkVisualization;


