import { useEffect, useRef } from "react";

interface ThemedBackgroundProps {
  type: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  swayOffset: number;
  swaySpeed: number;
  variant: number;
}

/* ---------- draw functions ---------- */

function drawHeart(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.3);
  ctx.bezierCurveTo(-s, -s * 1.2, -s * 1.6, s * 0.2, 0, s);
  ctx.bezierCurveTo(s * 1.6, s * 0.2, s, -s * 1.2, 0, -s * 0.3);
  ctx.closePath();
  ctx.fill();
}

function drawSnowflake(ctx: CanvasRenderingContext2D, s: number) {
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate((Math.PI / 3) * i);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -s);
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(-s * 0.25, -s * 0.8);
    ctx.moveTo(0, -s * 0.6);
    ctx.lineTo(s * 0.25, -s * 0.8);
    ctx.stroke();
    ctx.restore();
  }
}

function drawStar(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? "moveTo" : "lineTo";
    ctx[method](Math.cos(angle) * s, Math.sin(angle) * s);
  }
  ctx.closePath();
  ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.6, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.6, 0);
  ctx.closePath();
  ctx.fill();
}

function drawCircle(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.arc(0, 0, s, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlower(ctx: CanvasRenderingContext2D, s: number) {
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 / 5) * i);
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.35, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawBalloon(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.6, s * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, s * 0.8);
  ctx.lineTo(-s * 0.15, s * 1.1);
  ctx.lineTo(s * 0.15, s * 1.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, s * 1.1);
  ctx.quadraticCurveTo(s * 0.2, s * 1.4, 0, s * 1.6);
  ctx.stroke();
}

function drawTree(ctx: CanvasRenderingContext2D, s: number) {
  // Triangle tree
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(-s * 0.7, s * 0.3);
  ctx.lineTo(s * 0.7, s * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(-s * 0.85, s * 0.7);
  ctx.lineTo(s * 0.85, s * 0.7);
  ctx.closePath();
  ctx.fill();
  // Trunk
  ctx.fillRect(-s * 0.12, s * 0.7, s * 0.24, s * 0.35);
}

function drawPumpkin(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.8, s * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stem
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, -s * 0.65);
  ctx.quadraticCurveTo(0, -s * 1.1, s * 0.15, -s * 0.85);
  ctx.stroke();
}

function drawEgg(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.5, s * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Stripe
  ctx.beginPath();
  ctx.ellipse(0, s * 0.1, s * 0.48, s * 0.15, 0, 0, Math.PI * 2);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.globalAlpha *= 0.5;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha /= 0.5;
}

/* ---------- theme configs ---------- */

interface ThemeConfig {
  bgColor: string;
  colors: string[];
  count: number;
  drift: "up" | "down" | "mixed";
  drawFn: (ctx: CanvasRenderingContext2D, s: number, variant: number) => void;
  glows: { color: string; x: number; y: number; r: number }[];
}

const THEMES: Record<string, ThemeConfig> = {
  hearts: {
    bgColor: "rgb(22, 8, 16)",
    colors: [
      "rgba(220, 50, 80, VAR)",
      "rgba(255, 80, 120, VAR)",
      "rgba(200, 40, 100, VAR)",
      "rgba(255, 120, 160, VAR)",
      "rgba(180, 30, 70, VAR)",
    ],
    count: 40,
    drift: "up",
    drawFn: (ctx, s, v) => {
      if (v % 4 === 0) {
        // "Love" text
        ctx.font = `bold ${s * 1.2}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Love", 0, 0);
      } else {
        drawHeart(ctx, s);
      }
    },
    glows: [
      { color: "rgba(200, 40, 80, 0.07)", x: 0.25, y: 0.3, r: 0.4 },
      { color: "rgba(255, 60, 100, 0.05)", x: 0.75, y: 0.6, r: 0.35 },
      { color: "rgba(180, 30, 90, 0.04)", x: 0.5, y: 0.8, r: 0.3 },
    ],
  },
  snowflakes: {
    bgColor: "rgb(8, 14, 28)",
    colors: [
      "rgba(180, 220, 255, VAR)",
      "rgba(200, 230, 255, VAR)",
      "rgba(160, 200, 240, VAR)",
      "rgba(220, 240, 255, VAR)",
    ],
    count: 45,
    drift: "down",
    drawFn: (ctx, s) => {
      ctx.lineWidth = 1.5;
      drawSnowflake(ctx, s);
    },
    glows: [
      { color: "rgba(100, 160, 255, 0.06)", x: 0.3, y: 0.2, r: 0.4 },
      { color: "rgba(150, 200, 255, 0.04)", x: 0.7, y: 0.7, r: 0.35 },
    ],
  },
  fireworks: {
    bgColor: "rgb(10, 6, 20)",
    colors: [
      "rgba(255, 200, 50, VAR)",
      "rgba(255, 120, 50, VAR)",
      "rgba(255, 80, 80, VAR)",
      "rgba(100, 200, 255, VAR)",
      "rgba(255, 160, 0, VAR)",
    ],
    count: 35,
    drift: "up",
    drawFn: (ctx, s, v) => {
      if (v % 3 === 0) drawStar(ctx, s);
      else if (v % 3 === 1) drawDiamond(ctx, s * 0.7);
      else drawCircle(ctx, s * 0.4);
    },
    glows: [
      { color: "rgba(255, 180, 50, 0.06)", x: 0.2, y: 0.4, r: 0.3 },
      { color: "rgba(255, 100, 50, 0.04)", x: 0.8, y: 0.3, r: 0.25 },
      { color: "rgba(100, 150, 255, 0.04)", x: 0.5, y: 0.7, r: 0.3 },
    ],
  },
  flowers: {
    bgColor: "rgb(18, 10, 16)",
    colors: [
      "rgba(255, 150, 200, VAR)",
      "rgba(255, 180, 220, VAR)",
      "rgba(200, 120, 180, VAR)",
      "rgba(180, 220, 160, VAR)",
    ],
    count: 30,
    drift: "down",
    drawFn: (ctx, s) => drawFlower(ctx, s),
    glows: [
      { color: "rgba(255, 150, 200, 0.05)", x: 0.3, y: 0.3, r: 0.4 },
      { color: "rgba(200, 255, 180, 0.03)", x: 0.7, y: 0.6, r: 0.35 },
    ],
  },
  stars: {
    bgColor: "rgb(6, 8, 22)",
    colors: [
      "rgba(255, 220, 100, VAR)",
      "rgba(255, 240, 180, VAR)",
      "rgba(180, 200, 255, VAR)",
      "rgba(255, 200, 150, VAR)",
    ],
    count: 50,
    drift: "mixed",
    drawFn: (ctx, s, v) => {
      if (v % 2 === 0) drawStar(ctx, s);
      else drawCircle(ctx, s * 0.3);
    },
    glows: [
      { color: "rgba(200, 200, 255, 0.04)", x: 0.4, y: 0.3, r: 0.5 },
      { color: "rgba(255, 220, 100, 0.03)", x: 0.7, y: 0.6, r: 0.3 },
    ],
  },
  balloons: {
    bgColor: "rgb(12, 10, 22)",
    colors: [
      "rgba(255, 80, 80, VAR)",
      "rgba(80, 180, 255, VAR)",
      "rgba(255, 200, 50, VAR)",
      "rgba(100, 220, 100, VAR)",
      "rgba(220, 100, 255, VAR)",
    ],
    count: 25,
    drift: "up",
    drawFn: (ctx, s) => {
      ctx.lineWidth = 1;
      drawBalloon(ctx, s);
    },
    glows: [
      { color: "rgba(255, 100, 100, 0.04)", x: 0.3, y: 0.5, r: 0.3 },
      { color: "rgba(100, 180, 255, 0.04)", x: 0.7, y: 0.4, r: 0.3 },
    ],
  },
  confetti: {
    bgColor: "rgb(14, 10, 18)",
    colors: [
      "rgba(255, 80, 80, VAR)",
      "rgba(80, 200, 255, VAR)",
      "rgba(255, 200, 50, VAR)",
      "rgba(100, 255, 100, VAR)",
      "rgba(255, 100, 255, VAR)",
      "rgba(255, 160, 50, VAR)",
    ],
    count: 50,
    drift: "down",
    drawFn: (ctx, s) => {
      // Confetti rectangle
      ctx.fillRect(-s * 0.5, -s * 0.2, s, s * 0.4);
    },
    glows: [
      { color: "rgba(255, 200, 50, 0.04)", x: 0.5, y: 0.3, r: 0.4 },
    ],
  },
  christmas: {
    bgColor: "rgb(8, 14, 8)",
    colors: [
      "rgba(50, 160, 50, VAR)",
      "rgba(200, 50, 50, VAR)",
      "rgba(255, 200, 50, VAR)",
      "rgba(80, 180, 80, VAR)",
    ],
    count: 30,
    drift: "down",
    drawFn: (ctx, s, v) => {
      if (v % 3 === 0) drawTree(ctx, s);
      else if (v % 3 === 1) drawStar(ctx, s * 0.6);
      else drawCircle(ctx, s * 0.35);
    },
    glows: [
      { color: "rgba(200, 50, 50, 0.05)", x: 0.3, y: 0.4, r: 0.35 },
      { color: "rgba(50, 150, 50, 0.04)", x: 0.7, y: 0.6, r: 0.3 },
    ],
  },
  halloween: {
    bgColor: "rgb(14, 6, 18)",
    colors: [
      "rgba(255, 150, 0, VAR)",
      "rgba(200, 100, 0, VAR)",
      "rgba(150, 80, 200, VAR)",
      "rgba(255, 200, 50, VAR)",
    ],
    count: 28,
    drift: "mixed",
    drawFn: (ctx, s, v) => {
      if (v % 2 === 0) drawPumpkin(ctx, s);
      else drawStar(ctx, s * 0.5);
    },
    glows: [
      { color: "rgba(255, 150, 0, 0.06)", x: 0.5, y: 0.5, r: 0.5 },
      { color: "rgba(100, 0, 150, 0.04)", x: 0.3, y: 0.7, r: 0.3 },
    ],
  },
  easter: {
    bgColor: "rgb(14, 10, 20)",
    colors: [
      "rgba(200, 180, 255, VAR)",
      "rgba(255, 200, 150, VAR)",
      "rgba(180, 255, 200, VAR)",
      "rgba(255, 180, 220, VAR)",
    ],
    count: 30,
    drift: "down",
    drawFn: (ctx, s) => drawEgg(ctx, s),
    glows: [
      { color: "rgba(200, 180, 255, 0.05)", x: 0.4, y: 0.3, r: 0.4 },
      { color: "rgba(255, 200, 150, 0.04)", x: 0.6, y: 0.7, r: 0.3 },
    ],
  },
};

/* ---------- component ---------- */

const ThemedBackground = ({ type }: ThemedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = THEMES[type] || THEMES.stars;
    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];

    for (let i = 0; i < config.count; i++) {
      const baseVy =
        config.drift === "up"
          ? -(0.2 + Math.random() * 0.5)
          : config.drift === "down"
          ? 0.15 + Math.random() * 0.4
          : (Math.random() - 0.5) * 0.6;

      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: baseVy,
        size: 6 + Math.random() * 14,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.012,
        opacity: 0.15 + Math.random() * 0.25,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.004 + Math.random() * 0.008,
        variant: i,
      });
    }

    const animate = () => {
      time += 1;

      // Solid background
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated glow spots
      for (const glow of config.glows) {
        const gx = canvas.width * glow.x + Math.sin(time * 0.002) * 30;
        const gy = canvas.height * glow.y + Math.cos(time * 0.003) * 20;
        const gr = canvas.width * glow.r;
        const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
        gradient.addColorStop(0, glow.color);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw particles
      for (const p of particles) {
        const sway = Math.sin(time * p.swaySpeed + p.swayOffset) * 0.6;
        p.x += p.vx + sway;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Wrap
        if (p.y < -p.size * 3) {
          p.y = canvas.height + p.size * 3;
          p.x = Math.random() * canvas.width;
        }
        if (p.y > canvas.height + p.size * 3) {
          p.y = -p.size * 3;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -p.size * 3) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size * 3) p.x = -p.size;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        // Pick color
        const colorTemplate = config.colors[p.variant % config.colors.length];
        const color = colorTemplate.replace("VAR", String(p.opacity + 0.1));
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        config.drawFn(ctx, p.size, p.variant);

        ctx.restore();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ThemedBackground;
