import { useState, useEffect, useRef } from "react";
import clovisIcon from "@/assets/clovis-ai-icon.png";

interface FloatingClovisFabProps {
  onClick: () => void;
  label?: string;
}

const FloatingClovisFab = ({ onClick, label = "Clovis — Assistente IA Navarro" }: FloatingClovisFabProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(false);
  const frameRef = useRef<number>(0);
  const timerRef = useRef<number>(0);

  const FAB_SIZE = 56;
  const MARGIN = 24;

  const pickTarget = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxX = w - FAB_SIZE - MARGIN;
    const maxY = h - FAB_SIZE - MARGIN;

    // Pick a random edge-ish position (right side or bottom area, visible but not central)
    const zones = [
      // right edge
      { x: maxX, y: MARGIN + Math.random() * (maxY - MARGIN) },
      // bottom-right
      { x: maxX - Math.random() * 200, y: maxY },
      // bottom-left area
      { x: MARGIN + Math.random() * 200, y: maxY },
      // right-middle
      { x: maxX, y: h * 0.3 + Math.random() * (h * 0.4) },
    ];
    targetRef.current = zones[Math.floor(Math.random() * zones.length)];
  };

  useEffect(() => {
    // Initial position bottom-right
    const startX = window.innerWidth - FAB_SIZE - MARGIN;
    const startY = window.innerHeight - FAB_SIZE - MARGIN;
    currentRef.current = { x: startX, y: startY };
    setPos({ x: startX, y: startY });
    
    pickTarget();

    const animate = () => {
      // Skip movement when hovered
      if (!hoveredRef.current) {
        const speed = 0.003;
        const cx = currentRef.current.x;
        const cy = currentRef.current.y;
        const tx = targetRef.current.x;
        const ty = targetRef.current.y;

        const dx = tx - cx;
        const dy = ty - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          pickTarget();
        } else {
          currentRef.current.x += dx * speed;
          currentRef.current.y += dy * speed;
        }
      }

      const bobX = hoveredRef.current ? 0 : Math.sin(Date.now() * 0.001) * 3;
      const bobY = hoveredRef.current ? 0 : Math.cos(Date.now() * 0.0013) * 4;

      setPos({
        x: currentRef.current.x + bobX,
        y: currentRef.current.y + bobY,
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    // Pick new target periodically
    timerRef.current = window.setInterval(pickTarget, 8000);

    const handleResize = () => {
      const maxX = window.innerWidth - FAB_SIZE - MARGIN;
      const maxY = window.innerHeight - FAB_SIZE - MARGIN;
      currentRef.current.x = Math.min(currentRef.current.x, maxX);
      currentRef.current.y = Math.min(currentRef.current.y, maxY);
      pickTarget();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(timerRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); hoveredRef.current = true; }}
      onMouseLeave={() => { setHovered(false); hoveredRef.current = false; }}
      className={`fixed w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-colors hover:scale-110 group overflow-hidden p-0 border-0 bg-transparent ${hovered ? "cursor-pointer" : ""}`}
      style={{
        zIndex: 50,
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: "transform 0.2s",
      }}
      title={label}
    >
      <img src={clovisIcon} alt="Clovis IA" className="w-full h-full object-contain" />
      {/* Glow ring */}
      <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-30 pointer-events-none" />
    </button>
  );
};

export default FloatingClovisFab;
