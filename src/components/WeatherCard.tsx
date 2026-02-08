import { useState, useEffect } from "react";

const WeatherCard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const date = time.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="weather-card animate-float">
      <p className="text-3xl font-display font-bold text-foreground">☀️ 82°F</p>
      <p className="text-lg font-semibold text-foreground mt-1">{hours}</p>
      <p className="text-sm text-muted-foreground mt-1">{date}</p>
      <p className="text-xs text-muted-foreground mt-2">Florida, USA</p>
    </div>
  );
};

export default WeatherCard;
