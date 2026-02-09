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
}

const THEME_CONFIG: Record<string, { chars: string[]; color1: string; color2: string; count: number }> = {
  hearts: {
    chars: ["❤", "💕", "💖", "♥", "Love", "💗"],
    color1: "rgba(220, 40, 80, 0.12)",
    color2: "rgba(255, 105, 135, 0.08)",
    count: 30,
  },
  snowflakes: {
    chars: ["❄", "❅", "❆", "✧", "⋆"],
    color1: "rgba(180, 220, 255, 0.15)",
    color2: "rgba(200, 230, 255, 0.08)",
    count: 35,
  },
  fireworks: {
    chars: ["✦", "✧", "⭐", "🎆", "✨", "🎇"],
    color1: "rgba(255, 200, 50, 0.1)",
    color2: "rgba(255, 120, 50, 0.06)",
    count: 25,
  },
  flowers: {
    chars: ["🌸", "🌺", "🌼", "🌷", "🌻", "💐"],
    color1: "rgba(255, 150, 200, 0.1)",
    color2: "rgba(200, 230, 150, 0.06)",
    count: 25,
  },
  stars: {
    chars: ["⭐", "✨", "🌟", "💫", "⋆", "✧"],
    color1: "rgba(255, 220, 100, 0.1)",
    color2: "rgba(180, 180, 255, 0.06)",
    count: 30,
  },
  balloons: {
    chars: ["🎈", "🎉", "🎊", "🥳", "🎀"],
    color1: "rgba(255, 100, 100, 0.08)",
    color2: "rgba(100, 200, 255, 0.06)",
    count: 20,
  },
  confetti: {
    chars: ["🎊", "🎉", "✨", "⭐", "🎀", "🎶"],
    color1: "rgba(255, 180, 50, 0.08)",
    color2: "rgba(100, 200, 100, 0.06)",
    count: 30,
  },
  christmas: {
    chars: ["🎄", "🎅", "⭐", "❄", "🎁", "🔔"],
    color1: "rgba(200, 50, 50, 0.1)",
    color2: "rgba(50, 150, 50, 0.08)",
    count: 25,
  },
  halloween: {
    chars: ["🎃", "👻", "🦇", "🕷", "🕸", "💀"],
    color1: "rgba(255, 150, 0, 0.08)",
    color2: "rgba(100, 0, 150, 0.06)",
    count: 20,
  },
  easter: {
    chars: ["🐰", "🥚", "🌷", "🐣", "🌸"],
    color1: "rgba(200, 180, 255, 0.1)",
    color2: "rgba(255, 220, 150, 0.06)",
    count: 25,
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

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const items: FloatingItem[] = [];

    for (let i = 0; i < config.count; i++) {
      items.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.15 - Math.random() * 0.3,
        size: 12 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        opacity: 0.08 + Math.random() * 0.12,
        char: config.chars[Math.floor(Math.random() * config.chars.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle radial gradient overlay
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      gradient.addColorStop(0, config.color1);
      gradient.addColorStop(1, config.color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const item of items) {
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.rotationSpeed;

        // Wrap around
        if (item.y < -item.size) {
          item.y = canvas.height + item.size;
          item.x = Math.random() * canvas.width;
        }
        if (item.x < -item.size) item.x = canvas.width + item.size;
        if (item.x > canvas.width + item.size) item.x = -item.size;

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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ThemedBackground;
