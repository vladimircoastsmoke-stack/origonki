import { useEffect, useRef } from 'react';

const COLORS = ['#fc9838', '#fcfcfc', '#00e436', '#0058f8', '#f83800', '#f8b800', '#9858f8', '#fc38fc'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Burst {
  x: number;
  y: number;
  delay: number;
  fired: boolean;
}

function randomBurst(width: number, height: number, delay: number): Burst {
  return {
    x: width * (0.15 + Math.random() * 0.7),
    y: height * (0.12 + Math.random() * 0.45),
    delay,
    fired: false,
  };
}

function spawnBurst(x: number, y: number, count = 36): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 2 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 45 + Math.random() * 35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 3 + Math.floor(Math.random() * 3),
    });
  }
  return particles;
}

export function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstsRef = useRef<Burst[]>([]);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    startRef.current = performance.now();
    burstsRef.current = [
      randomBurst(canvas.width, canvas.height, 0),
      randomBurst(canvas.width, canvas.height, 600),
      randomBurst(canvas.width, canvas.height, 1200),
      randomBurst(canvas.width, canvas.height, 1800),
      randomBurst(canvas.width, canvas.height, 2600),
      randomBurst(canvas.width, canvas.height, 3400),
    ];

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const burst of burstsRef.current) {
        if (!burst.fired && elapsed >= burst.delay) {
          burst.fired = true;
          particlesRef.current.push(...spawnBurst(burst.x, burst.y));
        }
      }

      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.985;

        if (p.life < p.maxLife) {
          next.push(p);
          const alpha = 1 - p.life / p.maxLife;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
      }
      particlesRef.current = next;
      ctx.globalAlpha = 1;

      if (elapsed < 12000 || particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
      particlesRef.current = [];
    };
  }, []);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden />;
}
