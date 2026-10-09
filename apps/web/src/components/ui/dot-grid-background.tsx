import { useEffect, useRef } from 'react';

// Accent colours matching the site palette
const COLORS = [
  [0,   229, 255],  // #00E5FF cyan
  [0,   229, 255],
  [59,  130, 246],  // #3B82F6 blue
  [59,  130, 246],
  [168, 85,  247],  // #A855F7 purple
  [168, 85,  247],
];

const GRID   = 24;  // px between dot centres
const DOT_R  = 1.4; // dot radius in px
const MAX_OP = 0.25; // absolute max opacity (25%)

function rand(seed: number) {
  // fast deterministic pseudo-random [0,1)
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let start = performance.now();

    function resize() {
      if (!canvas) return;
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      if (!canvas || !ctx) return;
      const t = (performance.now() - start) / 1000; // seconds

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width  / GRID) + 1;
      const rows = Math.ceil(canvas.height / GRID) + 1;
      const cx   = cols / 2;
      const cy   = rows / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const seed = col * 397 + row * 1031;

          // Per-dot deterministic values
          const colorIdx     = Math.floor(rand(seed)       * COLORS.length);
          const phaseOffset  = rand(seed + 0.1) * Math.PI * 2;
          const speedFactor  = 0.4 + rand(seed + 0.2) * 0.8; // 0.4–1.2
          const baseBright   = 0.3 + rand(seed + 0.3) * 0.7; // per-dot brightness

          // Distance-based intro fade (dots near centre appear first)
          const dist  = Math.hypot(col - cx, row - cy);
          const intro = Math.max(0, Math.min(1, (t * 2.5 - dist * 0.04)));
          if (intro <= 0) continue;

          // Slow twinkle
          const twinkle = 0.5 + 0.5 * Math.sin(t * speedFactor + phaseOffset);
          const alpha   = intro * twinkle * baseBright * MAX_OP;
          if (alpha < 0.004) continue;

          const [r, g, b] = COLORS[colorIdx];
          const x = col * GRID;
          const y = row * GRID;

          ctx.beginPath();
          ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* Base background fill */}
      <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: '#050505' }} />

      {/* Dot grid canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        aria-hidden="true"
      />

      {/* Centre vignette so text stays readable */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'radial-gradient(ellipse 90% 70% at 50% 40%, rgba(5,5,5,0.45) 0%, rgba(5,5,5,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
