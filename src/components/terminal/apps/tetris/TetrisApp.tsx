"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TerminalAppProps } from "../../types";

type Cell = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0 empty, 1..7 tetromino ids

const COLS = 10;
const ROWS = 20;

// Tetromino rotation states (clockwise) using minimal matrices
const TETROMINOES: Record<number, number[][][]> = {
  1: [ // I
    [[1,1,1,1]],
    [[1],[1],[1],[1]],
  ],
  2: [ // J
    [[2,0,0],[2,2,2]],
    [[2,2],[2,0],[2,0]],
    [[2,2,2],[0,0,2]],
    [[0,2],[0,2],[2,2]],
  ],
  3: [ // L
    [[0,0,3],[3,3,3]],
    [[3,0],[3,0],[3,3]],
    [[3,3,3],[3,0,0]],
    [[3,3],[0,3],[0,3]],
  ],
  4: [ // O
    [[4,4],[4,4]],
  ],
  5: [ // S
    [[0,5,5],[5,5,0]],
    [[5,0],[5,5],[0,5]],
  ],
  6: [ // T
    [[0,6,0],[6,6,6]],
    [[6,0],[6,6],[6,0]],
    [[6,6,6],[0,6,0]],
    [[0,6],[6,6],[0,6]],
  ],
  7: [ // Z
    [[7,7,0],[0,7,7]],
    [[0,7],[7,7],[7,0]],
  ],
};

const COLORS = {
  0: "#0f172a",
  1: "#22d3ee",
  2: "#6366f1",
  3: "#f97316",
  4: "#eab308",
  5: "#10b981",
  6: "#a78bfa",
  7: "#ef4444",
} as const;

function rotateCW(shape: number[][]): number[][] {
  const rows = shape.length, cols = shape[0].length;
  const res: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) res[c][rows - 1 - r] = shape[r][c];
  return res;
}

// 7-bag randomizer for fair distribution
function* bagGenerator() {
  const ids = [1,2,3,4,5,6,7];
  while (true) {
    const bag = [...ids];
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    for (const id of bag) yield id;
  }
}

const TetrisApp: React.FC<TerminalAppProps> = ({ onExit, writeLine, registerKeyHandler, width, height }) => {
  const boardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const boardRef = useRef<Cell[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);

  const genRef = useRef<Generator<number>>(bagGenerator());
  const currentIdRef = useRef<number>(genRef.current.next().value as number);
  const currentShapeRef = useRef<number[][]>(TETROMINOES[currentIdRef.current][0].map(r => [...r]));
  const nextIdRef = useRef<number>(genRef.current.next().value as number);
  const posRef = useRef<{ x: number; y: number }>({ x: Math.floor(COLS / 2) - 2, y: -1 });
  const tickMsRef = useRef(700);

  // Helpers
  const collides = (nx: number, ny: number, shape = currentShapeRef.current): boolean => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        const v = shape[r][c] as Cell; if (!v) continue;
        const x = nx + c, y = ny + r;
        if (x < 0 || x >= COLS || y >= ROWS) return true;
        if (y >= 0 && boardRef.current[y][x] !== 0) return true;
      }
    }
    return false;
  };

  const merge = () => {
    const b = boardRef.current.map(row => [...row]) as Cell[][];
    const shape = currentShapeRef.current; const { x: px, y: py } = posRef.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        const v = shape[r][c] as Cell; if (!v) continue;
        const x = px + c, y = py + r;
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) b[y][x] = v;
      }
    }
    boardRef.current = b;
  };

  const clearLines = () => {
    const b = boardRef.current;
    let cleared = 0;
    for (let r = b.length - 1; r >= 0; r--) {
      if (b[r].every(v => v !== 0)) { b.splice(r, 1); b.unshift(Array(COLS).fill(0) as Cell[]); cleared++; r++; }
    }
    if (cleared) {
      const add = [0, 100, 300, 500, 800][cleared];
      setScore(s => s + add * level);
      setLines(l => l + cleared);
      if (((lines + cleared) % 10) === 0) { setLevel(l => l + 1); tickMsRef.current = Math.max(120, tickMsRef.current - 60); }
      writeLine(`Cleared ${cleared} line(s)` , "success");
    }
  };

  const spawn = () => {
    currentIdRef.current = nextIdRef.current;
    currentShapeRef.current = TETROMINOES[currentIdRef.current][0].map(r => [...r]);
    nextIdRef.current = genRef.current.next().value as number;
    posRef.current = { x: Math.floor(COLS / 2) - 2, y: -1 };
    if (collides(posRef.current.x, 0)) {
      setOver(true);
      writeLine(`Tetris game over. Final score ${score}`, "error");
    }
  };

  // Input handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over) { if (e.key === "q" || e.key === "Q") onExit(); return; }
      if (e.key === "q" || e.key === "Q") { onExit(); return; }
      if (e.key === "p" || e.key === "P") { e.preventDefault(); setPaused(p => !p); return; }
      if (paused) return;
      const { x, y } = posRef.current;
      if (e.key === "ArrowLeft") { e.preventDefault(); if (!collides(x - 1, y)) posRef.current = { x: x - 1, y }; }
      else if (e.key === "ArrowRight") { e.preventDefault(); if (!collides(x + 1, y)) posRef.current = { x: x + 1, y }; }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (!collides(x, y + 1)) posRef.current = { x, y: y + 1 }; }
      else if (e.key === "ArrowUp") { e.preventDefault(); const rot = rotateCW(currentShapeRef.current); if (!collides(x, y, rot)) currentShapeRef.current = rot; }
      else if (e.code === "Space") { e.preventDefault(); let ny = y, guard = 0; while (!collides(x, ny + 1) && guard++ < ROWS) ny++; posRef.current = { x, y: ny }; }
    };
    registerKeyHandler(onKey);
    return () => registerKeyHandler(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerKeyHandler, onExit, writeLine, paused, over]);

  // Drawing + game loop
  useEffect(() => {
    const boardCtx = boardCanvasRef.current?.getContext("2d");
    const nextCtx = nextCanvasRef.current?.getContext("2d");
    if (!boardCtx || !nextCtx) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    // Fit board with sane bounds: max ~60% width, ~85% height, and cap cell size
    const boardMaxW = width * 0.6;
    const boardMaxH = height * 0.85;
    const cell = Math.max(12, Math.min(26, Math.floor(Math.min(boardMaxW / COLS, boardMaxH / ROWS))));
    const viewW = COLS * cell, viewH = ROWS * cell;
    boardCanvasRef.current!.width = viewW * pixelRatio; boardCanvasRef.current!.height = viewH * pixelRatio;
    boardCanvasRef.current!.style.width = `${viewW}px`; boardCanvasRef.current!.style.height = `${viewH}px`;
    boardCtx.scale(pixelRatio, pixelRatio);
    // Next preview 5x5
    const nCell = Math.max(8, Math.floor(cell * 0.58)); const nSize = nCell * 5;
    nextCanvasRef.current!.width = nSize * pixelRatio; nextCanvasRef.current!.height = nSize * pixelRatio;
    nextCanvasRef.current!.style.width = `${nSize}px`; nextCanvasRef.current!.style.height = `${nSize}px`;
    nextCtx.scale(pixelRatio, pixelRatio);
    // @ts-ignore
    boardCtx.imageSmoothingEnabled = false; // crisp
    // @ts-ignore
    nextCtx.imageSmoothingEnabled = false;

    const drawBoard = () => {
      const ctx = boardCtx; ctx.clearRect(0, 0, viewW, viewH);
      // top padding to avoid header overlap visually (handled outside too)
      ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, viewW, viewH);
      // grid
      ctx.strokeStyle = "rgba(8,145,178,0.07)"; ctx.lineWidth = 1;
      for (let gx = 0; gx <= COLS; gx++) { ctx.beginPath(); ctx.moveTo(gx * cell + 0.5, 0); ctx.lineTo(gx * cell + 0.5, viewH); ctx.stroke(); }
      for (let gy = 0; gy <= ROWS; gy++) { ctx.beginPath(); ctx.moveTo(0, gy * cell + 0.5); ctx.lineTo(viewW, gy * cell + 0.5); ctx.stroke(); }
      const pad = Math.max(1, Math.floor(cell * 0.12));
      // fixed blocks
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const v = boardRef.current[r][c] as keyof typeof COLORS; if (!v) continue;
        ctx.fillStyle = COLORS[v]; ctx.fillRect(c * cell + pad, r * cell + pad, cell - pad * 2, cell - pad * 2);
      }
      // current piece
      const shape = currentShapeRef.current; const { x, y } = posRef.current;
      for (let r = 0; r < shape.length; r++) for (let c = 0; c < shape[r].length; c++) {
        const v = shape[r][c] as keyof typeof COLORS; if (!v) continue; const px = (x + c) * cell, py = (y + r) * cell; if (py >= 0) { ctx.fillStyle = COLORS[v]; ctx.fillRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2); }
      }
      if (paused) { ctx.fillStyle = "#eab308"; ctx.font = "bold 16px monospace"; ctx.fillText("PAUSED", viewW / 2 - 36, 24); }
      if (over) { ctx.fillStyle = "#ef4444"; ctx.font = "bold 16px monospace"; ctx.fillText("GAME OVER - Press Q", viewW / 2 - 90, 24); }
    };

    const drawNext = () => {
      const ctx = nextCtx; ctx.clearRect(0, 0, nSize, nSize); ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, nSize, nSize);
      const grid = TETROMINOES[nextIdRef.current][0]; const offsetX = Math.floor((5 - grid[0].length) / 2); const offsetY = Math.ceil((5 - grid.length) / 2); const pad = Math.max(1, Math.floor(nCell * 0.12));
      // grid lines
      ctx.strokeStyle = "rgba(8,145,178,0.07)"; ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(i * nCell + 0.5, 0); ctx.lineTo(i * nCell + 0.5, nSize); ctx.stroke(); }
      for (let i = 0; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(0, i * nCell + 0.5); ctx.lineTo(nSize, i * nCell + 0.5); ctx.stroke(); }
      for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[r].length; c++) { const v = grid[r][c] as keyof typeof COLORS; if (!v) continue; ctx.fillStyle = COLORS[v]; ctx.fillRect((c + offsetX) * nCell + pad, (r + offsetY) * nCell + pad, nCell - pad * 2, nCell - pad * 2); }
    };

    let raf = 0, last = 0, acc = 0;
    const loop = (t: number) => {
      const dt = t - last; last = t; acc += dt;
      if (!paused && !over && acc >= tickMsRef.current) {
        acc = 0;
        const { x, y } = posRef.current;
        if (!collides(x, y + 1)) posRef.current = { x, y: y + 1 };
        else {
          merge();
          clearLines();
          spawn();
        }
      }
      drawBoard(); drawNext();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((t) => { last = t; loop(t); });
    return () => cancelAnimationFrame(raf);
  }, [width, height, score, lines, level, paused, over]);

  return (
    <div className="flex items-start gap-4 select-none">
      <canvas ref={boardCanvasRef} className="rounded border border-cyan-500/30 shadow-lg bg-black/70 flex-shrink-0" />
      <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1">
        <div className="text-[10px] font-mono text-gray-400 mb-1">NEXT</div>
        <canvas ref={nextCanvasRef} className="rounded border border-cyan-500/30 bg-black/70" />
      </div>
    </div>
  );
};

export default TetrisApp;


