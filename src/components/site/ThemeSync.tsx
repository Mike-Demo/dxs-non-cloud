import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { settingsQuery } from "@/lib/data/queries";

/** Applies the saved theme preference to the document. */
export const ThemeSync = () => {
  const { data } = useQuery(settingsQuery());
  const theme = data?.theme ?? "light";
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (): void => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
  return null;
};
