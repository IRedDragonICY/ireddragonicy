// src/components/terminal/apps/index.ts
"use client";

import type { TerminalAppManifest } from "../types";
import SnakeApp from "./snake/SnakeApp";
import TetrisApp from "./tetris/TetrisApp";

export const APPS: TerminalAppManifest[] = [
  {
    id: "snake",
    name: "Snake",
    description: "Classic snake game inside the terminal console.",
    keywords: ["game", "snake", "retro"],
    component: SnakeApp,
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Falling blocks puzzle with rotation, scoring, levels.",
    keywords: ["game", "tetris", "blocks"],
    component: TetrisApp,
  },
];

export const appMap: Record<string, TerminalAppManifest> = APPS.reduce((map, app) => {
  map[app.id] = app;
  return map;
}, {} as Record<string, TerminalAppManifest>);


