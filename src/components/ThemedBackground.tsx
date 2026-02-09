import { useEffect, useRef } from "react";

interface ThemedBackgroundProps {
  type: string;
}

interface FloatingItem {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  char: string;
  swayOffset: number;
  swaySpeed: number;
}

const THEME_CONFIG: Record<string, { chars: string[]; bgColor: string; glowColor: string; count: number; drift: "up" | "down" | "mixed" }> = {
  hearts: {
    chars: ["❤", "💕", "💖", "♥", "Love", "💗", "💘", "💝"],
    bgColor: "rgba(40, 10, 20, 1)",
    glowColor: "rgba(180, 40, 70, 0.08)",
    count: 45,
    drift: "up",
  },
  snowflakes: {
    chars: ["❄", "❅", "❆", "✧", "⋆", "✦"],
    bgColor: "rgba(10, 18, 35, 1)",
    glowColor: "rgba(150, 200, 255, 0.06)",
    count: 50,
    drift: "down",
  },
  fireworks: {
    chars: ["✦", "✧", "⭐", "🎆", "✨", "🎇", "💥"],
    bgColor: "rgba(15, 10, 25, 1)",
    glowColor: "rgba(255, 200, 50, 0.06)",
    count: 35,
    drift: "up",
  },
  flowers: {
    chars: ["🌸", "🌺", "🌼", "🌷", "🌻", "💐", "🌹"],
    bgColor: "rgba(20, 12, 18, 1)",
    glowColor: "rgba(255, 150, 200, 0.06)",
    count: 35,
    drift: "down",
  },
  stars: {
    chars: ["⭐", "✨", "🌟", "💫", "⋆", "✧", "✦"],
    bgColor: "rgba(8, 10, 25, 1)",
    glowColor: "rgba(255, 220, 100, 0.05)",
    count: 45,
    drift: "mixed",
  },
  balloons: {
    chars: ["🎈", "🎉", "🎊", "🥳", "🎀", "🎁"],
    bgColor: "rgba(15, 12, 25, 1)",
    glowColor: "rgba(255, 100, 100, 0.05)",
    count: 30,
    drift: "up",
  },
  confetti: {
    chars: ["🎊", "🎉", "✨", "⭐", "🎀", "🎶", "🎵"],
    bgColor: "rgba(15, 12, 20, 1)",
    glowColor: "rgba(255, 180, 50, 0.05)",
    count: 40,
    drift: "down",
  },
  christmas: {
    chars: ["🎄", "🎅", "⭐", "❄", "🎁", "🔔", "🦌"],
    bgColor: "rgba(12, 15, 10, 1)",
    glowColor: "rgba(200, 50, 50, 0.06)",
    count: 35,
    drift: "down",
  },
  halloween: {
    chars: ["🎃", "👻", "🦇", "🕷", "🕸", "💀", "🌙"],
    bgColor: "rgba(15, 8, 20, 1)",
    glowColor: "rgba(255, 150, 0, 0.05)",
    count: 30,
    drift: "mixed",
  },
  easter: {
    chars: ["🐰", "🥚", "🌷", "🐣", "🌸", "🦋"],
    bgColor: "rgba(15, 12, 22, 1)",
    glowColor: "rgba(200, 180, 255, 0.06)",
    count: 35,
    drift: "down",
  },
};

const ThemedBackground = ({ type }: ThemedBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = THEME_CONFIG[type] || THEME_CONFIG.stars;
    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const items: FloatingItem[] = [];

    for (let i = 0; i < config.count; i++) {
      const baseVy = config.drift === "up" ? -(0.2 + Math.random() * 0.4)
        : config.drift === "down" ? (0.15 + Math.random() * 0.35)
        : (Math.random() - 0.5) * 0.5;

      items.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: baseVy,
        size: 14 + Math.random() * 22,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.008,
        opacity: 0.12 + Math.random() * 0.18,
        char: config.chars[Math.floor(Math.random() * config.chars.length)],
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.005 + Math.random() * 0.01,
      });
    }

    const animate = () => {
      time += 1;

      // Draw solid dark background (covers the page bg)
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle glow spots
      for (let g = 0; g < 3; g++) {
        const gx = canvas.width * (0.2 + g * 0.3);
        const gy = canvas.height * (0.3 + Math.sin(time * 0.003 + g) * 0.1);
        const gradient = ctx.createRadialGradient(gx, gy, 0, gx, gy, canvas.width * 0.35);
        gradient.addColorStop(0, config.glowColor);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw floating items
      for (const item of items) {
        // Sway movement
        const sway = Math.sin(time * item.swaySpeed + item.swayOffset) * 0.5;
        item.x += item.vx + sway;
        item.y += item.vy;
        item.rotation += item.rotationSpeed;

        // Wrap around
        if (item.y < -item.size * 2) {
          item.y = canvas.height + item.size * 2;
          item.x = Math.random() * canvas.width;
        }
        if (item.y > canvas.height + item.size * 2) {
          item.y = -item.size * 2;
          item.x = Math.random() * canvas.width;
        }
        if (item.x < -item.size * 2) item.x = canvas.width + item.size;
        if (item.x > canvas.width + item.size * 2) item.x = -item.size;

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.globalAlpha = item.opacity;
        ctx.font = `${item.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.char, 0, 0);
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
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

export default ThemedBackground;
