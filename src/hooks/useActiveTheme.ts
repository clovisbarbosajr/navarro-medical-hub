import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { HolidayTheme } from "@/types/database";

/**
 * Reads the currently active holiday theme from the DB
 * and applies its CSS overrides to the document root.
 */
const useActiveTheme = () => {
  const [activeTheme, setActiveTheme] = useState<HolidayTheme | null>(null);

  useEffect(() => {
    const fetchTheme = async () => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await (supabase as any)
        .from("holiday_themes")
        .select("*")
        .eq("enabled", true)
        .lte("activation_start", today)
        .gte("activation_end", today)
        .order("is_professional_date", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setActiveTheme(data[0]);
      }
    };

    fetchTheme();
  }, []);

  // Apply CSS overrides
  useEffect(() => {
    if (!activeTheme?.css_overrides) return;

    const root = document.documentElement;
    const overrides = activeTheme.css_overrides as Record<string, string>;
    const originalValues: Record<string, string> = {};

    Object.entries(overrides).forEach(([key, value]) => {
      originalValues[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    });

    return () => {
      Object.entries(originalValues).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value);
        } else {
          root.style.removeProperty(key);
        }
      });
    };
  }, [activeTheme]);

  return activeTheme;
};

export default useActiveTheme;
