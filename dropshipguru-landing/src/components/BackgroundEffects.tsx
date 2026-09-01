"use client";

import { motion } from "framer-motion";

const NODES = [
  { x: 8, y: 15 },
  { x: 22, y: 28 },
  { x: 35, y: 12 },
  { x: 48, y: 35 },
  { x: 62, y: 18 },
  { x: 75, y: 42 },
  { x: 88, y: 22 },
  { x: 15, y: 55 },
  { x: 30, y: 68 },
  { x: 52, y: 58 },
  { x: 68, y: 72 },
  { x: 82, y: 55 },
  { x: 42, y: 82 },
  { x: 58, y: 88 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [0, 7],
  [1, 7],
  [3, 9],
  [4, 9],
  [5, 11],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [8, 12],
  [9, 12],
  [10, 13],
  [11, 13],
];

export default function BackgroundEffects() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {/* Purple orb — bottom-left */}
      <motion.div
        className="absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full bg-purple-deep/30 blur-[120px] md:block"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.06, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Gold orb — center-right */}
      <motion.div
        className="absolute top-1/3 -right-24 h-[480px] w-[480px] rounded-full bg-gold/20 blur-[110px] md:block"
        animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Constellation network */}
      <motion.svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        animate={{ x: [0, 6, 0], y: [0, -4, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
      >
        {EDGES.map(([a, b], i) => (
          <line
            key={i}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="rgba(245,180,0,0.15)"
            strokeWidth="0.08"
          />
        ))}
        {NODES.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="0.35"
            fill="rgba(245,180,0,0.5)"
            style={{ filter: "drop-shadow(0 0 2px rgba(245,180,0,0.8))" }}
          />
        ))}
      </motion.svg>
    </div>
  );
}
