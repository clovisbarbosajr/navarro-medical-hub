import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  trail: { x: number; y: number }[];
}

const FlowFieldBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let mouseX = -1000;
    let mouseY = -1000;
    const particles: Particle[] = [];
    const PARTICLE_COUNT = 40;
    const TRAIL_LENGTH = 20;
    const TRAIL_OPACITY = 0.12;
    const MOUSE_RADIUS = 150;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const noise = (x: number, y: number, t: number) => {
      return (
        Math.sin(x * 0.01 + t) * Math.cos(y * 0.012 + t * 0.8) +
        Math.sin((x + y) * 0.008 + t * 0.5) * 0.5
      );
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 600 + Math.random() * 800,
      size: 0.6 + Math.random() * 1.0,
      trail: [],
    });

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let time = 0;

    const animate = () => {
      time += 0.0004;
      ctx.fillStyle = "rgba(13, 17, 28, 0.04)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const angle = noise(p.x, p.y, time) * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.04;
        p.vy += Math.sin(angle) * 0.04;

        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.3;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift();

        if (p.trail.length > 1) {
          const lifeRatio = 1 - Math.abs(2 * (p.life / p.maxLife) - 1);
          for (let j = 1; j < p.trail.length; j++) {
            const t = j / p.trail.length;
            const alpha = t * TRAIL_OPACITY * lifeRatio;
            ctx.beginPath();
            ctx.moveTo(p.trail[j - 1].x, p.trail[j - 1].y);
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
            ctx.strokeStyle = `hsla(210, 100%, 65%, ${alpha})`;
            ctx.lineWidth = p.size * t;
            ctx.stroke();
          }
        }

        const lifeAlpha = 1 - Math.abs(2 * (p.life / p.maxLife) - 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(174, 72%, 56%, ${lifeAlpha * 0.35})`;
        ctx.fill();

        if (
          p.life >= p.maxLife ||
          p.x < -50 || p.x > canvas.width + 50 ||
          p.y < -50 || p.y > canvas.height + 50
        ) {
          Object.assign(particles[i], createParticle());
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FlowFieldBackground;
