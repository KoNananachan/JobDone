import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  life: number;
}

const COLORS = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#A78BFA', '#F472B6'];

export function Confetti({ tick }: { tick: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const tickRender = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      const ps = particlesRef.current;
      for (const p of ps) {
        p.vy += 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 80));
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }
      particlesRef.current = ps.filter((p) => p.life > 0 && p.y < h + 40);
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tickRender);
      } else {
        rafRef.current = null;
      }
    };

    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tickRender);
    };
    (canvas as any)._start = start;

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!tick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const cx = w / 2;
    const cy = 80;
    const burst: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.4;
      const speed = 3 + Math.random() * 4;
      burst.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 80 + Math.random() * 40,
      });
    }
    particlesRef.current.push(...burst);
    (canvas as any)._start?.();
  }, [tick]);

  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
