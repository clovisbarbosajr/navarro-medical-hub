import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

const INACTIVITY_TIMEOUTS: Record<string, number> = {
  "inwise@navarro.med": 5 * 60 * 1000,   // 5 minutes
  "ligia@navarro.med": 30 * 60 * 1000,    // 30 minutes
};

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

const useInactivityLogout = () => {
  const { user, logout } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const email = user?.email || "";
  const timeout = INACTIVITY_TIMEOUTS[email];

  const resetTimer = useCallback(() => {
    if (!timeout) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      console.log(`[Inactivity] Logging out ${email} after ${timeout / 60000} min`);
      logout();
    }, timeout);
  }, [timeout, email, logout]);

  useEffect(() => {
    if (!timeout || !user) return;

    // Start timer
    resetTimer();

    // Reset on activity
    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [timeout, user, resetTimer]);
};

export default useInactivityLogout;
