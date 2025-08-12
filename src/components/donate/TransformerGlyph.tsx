'use client';

import React, { useEffect, useRef } from 'react';

type TransformerGlyphProps = {
  className?: string;
  hue?: number; // base hue for gradient accents
};

/**
 * Decorative animated SVG glyph inspired by Transformer attention heads.
 * - Pulsing concentric rings and rotating head lines
 */
const TransformerGlyph: React.FC<TransformerGlyphProps> = ({ className = '', hue = 200 }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    let frame = 0;
    let raf: number | null = null;
    const gradient = svg.querySelector('#tg-grad') as SVGLinearGradientElement | null;
    const rings = Array.from(svg.querySelectorAll('.ring')) as SVGCircleElement[];
    const heads = Array.from(svg.querySelectorAll('.head')) as SVGPathElement[];

    const tick = () => {
      frame += 1;
      const t = frame / 60;
      const h1 = (hue + (Math.sin(t * 0.6) * 20)) % 360;
      const h2 = (hue + 120 + (Math.cos(t * 0.7) * 20)) % 360;
      if (gradient) {
        const s1 = `hsl(${h1} 90% 60%)`;
        const s2 = `hsl(${h2} 90% 60%)`;
        const stops = gradient.querySelectorAll('stop');
        stops[0]?.setAttribute('stop-color', s1);
        stops[1]?.setAttribute('stop-color', s2);
      }

      rings.forEach((r, i) => {
        const pulse = 1 + 0.06 * Math.sin(t * 2 + i);
        r.setAttribute('transform', `scale(${pulse})`);
        r.setAttribute('opacity', String(0.35 + 0.2 * Math.sin(t * 1.5 + i)));
      });

      heads.forEach((p, i) => {
        const rot = (t * 20 * (i % 2 === 0 ? 1 : -1)) % 360;
        p.setAttribute('transform', `rotate(${rot} 64 64)`);
        p.setAttribute('opacity', String(0.7 + 0.3 * Math.sin(t + i)));
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hue]);

  return (
    <svg ref={ref} viewBox="0 0 128 128" className={className} aria-hidden>
      <defs>
        <linearGradient id="tg-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(200 90% 60%)" />
          <stop offset="100%" stopColor="hsl(320 90% 60%)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#tg-grad)">
        <circle className="ring" cx="64" cy="64" r="24" strokeWidth="2" />
        <circle className="ring" cx="64" cy="64" r="40" strokeWidth="2" />
        <circle className="ring" cx="64" cy="64" r="56" strokeWidth="2" />
        <path className="head" d="M16,64 Q64,16 112,64" strokeWidth="2.5" />
        <path className="head" d="M16,64 Q64,112 112,64" strokeWidth="2.5" />
      </g>
      <g fill="url(#tg-grad)">
        <circle cx="64" cy="64" r="3" />
      </g>
    </svg>
  );
};

export default TransformerGlyph;



