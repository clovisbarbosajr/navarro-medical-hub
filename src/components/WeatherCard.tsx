import { useState, useEffect } from "react";

const WeatherCard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>☀️ 82°F</span>
      <span className="opacity-40">|</span>
      <span>{hours}</span>
      <span className="opacity-40">|</span>
      <span>{date}</span>
      <span className="opacity-40">|</span>
      <span>Florida, USA</span>
    </div>
  );
};

export default WeatherCard;
