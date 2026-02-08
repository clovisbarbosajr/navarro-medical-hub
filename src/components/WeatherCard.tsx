import { useState, useEffect } from "react";

const WeatherCard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const date = time.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="weather-card animate-float">
      <p className="text-3xl font-display font-bold text-foreground">☀️ 28°C</p>
      <p className="text-lg font-semibold text-foreground mt-1">{hours}</p>
      <p className="text-sm text-muted-foreground capitalize mt-1">{date}</p>
      <p className="text-xs text-muted-foreground mt-2">São Paulo, SP</p>
    </div>
  );
};

export default WeatherCard;
