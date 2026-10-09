import { useEffect, useRef } from 'react';

// Particle sphere — pure Canvas 2D, no deps
const PARTICLE_COUNT = 280;
const SPHERE_COLORS  = ['#00E5FF', '#3B82F6', '#A855F7'];

export default function ParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = canvas.offsetWidth || 200;
    canvas.width  = SIZE;
    canvas.height = SIZE;
    const R = SIZE * 0.42;
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    // Generate particles on sphere surface using Fibonacci lattice
    interface Particle { theta: number; phi: number; r: number; color: string; size: number }
    const particles: Particle[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const y     = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const theta = golden * i;
      particles.push({
        theta,
        phi: Math.asin(y),
        r:   R * (0.85 + Math.random() * 0.15),
        color: SPHERE_COLORS[i % SPHERE_COLORS.length],
        size: 0.9 + Math.random() * 1.1,
      });
    }

    let raf: number;
    let angle = 0;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, SIZE, SIZE);

      angle += 0.004;

      // Sort by z for painter's algorithm
      const projected = particles.map((p) => {
        const x3 = p.r * Math.cos(p.phi) * Math.cos(p.theta + angle);
        const z3 = p.r * Math.cos(p.phi) * Math.sin(p.theta + angle);
        const y3 = p.r * Math.sin(p.phi);
        // Simple perspective
        const scale = (SIZE * 0.6) / (SIZE * 0.6 + z3);
        const px = cx + x3 * scale;
        const py = cy - y3 * scale;
        const depth = (z3 + R) / (2 * R); // 0=back, 1=front
        return { px, py, depth, color: p.color, size: p.size };
      });

      projected.sort((a, b) => a.depth - b.depth);

      for (const p of projected) {
        const alpha = 0.15 + p.depth * 0.65;
        const radius = p.size * (0.6 + p.depth * 0.8);
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }

      // Subtle glow at center
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      grd.addColorStop(0, 'rgba(0,229,255,0.04)');
      grd.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    />
  );
}
