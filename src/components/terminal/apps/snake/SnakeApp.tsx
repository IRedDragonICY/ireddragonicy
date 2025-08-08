"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TerminalAppProps } from "../../types";

interface Point { x: number; y: number }

const GRID_COLS = 24;
const GRID_ROWS = 18;
const TICK_MS_START = 140;

const SnakeApp: React.FC<TerminalAppProps> = ({ onExit, writeLine, registerKeyHandler, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  // Use ref for direction to avoid rerenders on every arrow press
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const [speed, setSpeed] = useState(TICK_MS_START);
  const tickRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string | null>(null);

  const initialSnake = useMemo<Point[]>(() => [
    { x: 5, y: 8 },
    { x: 4, y: 8 },
    { x: 3, y: 8 },
  ], []);

  const snakeRef = useRef<Point[]>([...initialSnake]);
  const foodRef = useRef<Point>({ x: 12, y: 8 });

  const placeFood = () => {
    let p: Point;
    do {
      p = { x: Math.floor(Math.random() * GRID_COLS), y: Math.floor(Math.random() * GRID_ROWS) };
    } while (snakeRef.current.some(s => s.x === p.x && s.y === p.y));
    foodRef.current = p;
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Q") { e.preventDefault(); onExit(); return; }
      if (e.key === "p" || e.key === "P") { e.preventDefault(); setPaused(p => !p); return; }
      if (gameOver) return;
      const setDirSafely = (nx: number, ny: number) => {
        // prevent 180° reversal
        if (dirRef.current.x === -nx && dirRef.current.y === -ny) return;
        dirRef.current = { x: nx, y: ny };
      };
      if (e.key === "ArrowUp") { e.preventDefault(); setDirSafely(0, -1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setDirSafely(0, 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setDirSafely(-1, 0); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setDirSafely(1, 0); }
      lastKeyRef.current = e.key;
    };
    registerKeyHandler(handler);
    return () => registerKeyHandler(null);
  // depend hanya pada fungsi untuk mencegah re-mount saat state berubah di parent
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onExit, registerKeyHandler, writeLine]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    // Compute cell so entire grid fits into the viewport exactly, no clipping
    const cell = Math.max(10, Math.floor(Math.min(width / GRID_COLS, height / GRID_ROWS)));
    const viewW = GRID_COLS * cell;
    const viewH = GRID_ROWS * cell;
    canvasRef.current!.width = viewW * pixelRatio;
    canvasRef.current!.height = viewH * pixelRatio;
    canvasRef.current!.style.width = `${viewW}px`;
    canvasRef.current!.style.height = `${viewH}px`;
    ctx.scale(pixelRatio, pixelRatio);
    // Disable smoothing for crisp grid
    // @ts-ignore
    ctx.imageSmoothingEnabled = false;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, viewW, viewH);
      // grid bg
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, viewW, viewH);
      // draw faint grid lines for better perception
      ctx.strokeStyle = "rgba(8,145,178,0.07)";
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= GRID_COLS; gx++) {
        ctx.beginPath();
        ctx.moveTo(gx * cell + 0.5, 0);
        ctx.lineTo(gx * cell + 0.5, viewH);
        ctx.stroke();
      }
      for (let gy = 0; gy <= GRID_ROWS; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, gy * cell + 0.5);
        ctx.lineTo(viewW, gy * cell + 0.5);
        ctx.stroke();
      }
      // snake
      for (let i = 0; i < snakeRef.current.length; i++) {
        const s = snakeRef.current[i];
        ctx.fillStyle = i === 0 ? "#22d3ee" : "#0ea5b7";
        const pad = Math.max(1, Math.floor(cell * 0.12));
        ctx.fillRect(s.x * cell + pad, s.y * cell + pad, cell - pad * 2, cell - pad * 2);
      }
      // food
      ctx.fillStyle = "#f59e0b";
      const fpad = Math.max(1, Math.floor(cell * 0.18));
      ctx.fillRect(foodRef.current.x * cell + fpad, foodRef.current.y * cell + fpad, cell - fpad * 2, cell - fpad * 2);
      // HUD
      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px monospace";
      ctx.fillText(`Score ${score}  Level ${level}  Speed ${Math.max(30, speed)}ms  Q:quit P:pause`, 6, viewH - 6);
      if (paused) {
        ctx.fillStyle = "#eab308";
        ctx.font = "bold 16px monospace";
        ctx.fillText("PAUSED", viewW / 2 - 36, 24);
      }
      if (gameOver) {
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 16px monospace";
        ctx.fillText("GAME OVER - Press Q", viewW / 2 - 90, 24);
      }
    };

    const step = () => {
      if (paused || gameOver) { draw(); schedule(); return; }
      const nextHead: Point = {
        x: (snakeRef.current[0].x + dirRef.current.x + GRID_COLS) % GRID_COLS,
        y: (snakeRef.current[0].y + dirRef.current.y + GRID_ROWS) % GRID_ROWS,
      };
      // self collision
      if (snakeRef.current.some((p, i) => i !== 0 && p.x === nextHead.x && p.y === nextHead.y)) {
        setGameOver(true);
        writeLine(`Snake crashed. Final score: ${score}`, "error");
        draw();
        return;
      }
      const ate = nextHead.x === foodRef.current.x && nextHead.y === foodRef.current.y;
      snakeRef.current = [nextHead, ...snakeRef.current.slice(0, ate ? undefined : -1)];
      if (ate) {
        setScore(s => s + 10);
        if ((score + 10) % 50 === 0) {
          setLevel(l => l + 1);
          setSpeed(sp => Math.max(40, sp - 10));
        }
        placeFood();
      }
      draw();
      schedule();
    };

    const schedule = () => {
      if (tickRef.current !== null) clearTimeout(tickRef.current);
      tickRef.current = window.setTimeout(() => requestAnimationFrame(step), speed) as unknown as number;
    };
    schedule();
    return () => { if (tickRef.current !== null) clearTimeout(tickRef.current); };
  }, [width, height, paused, gameOver, speed]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded border border-cyan-500/30 shadow-lg bg-black/70" />
    </div>
  );
};

export default SnakeApp;


