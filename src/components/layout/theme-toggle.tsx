"use client";

import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const onToggle = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const nextTheme: Theme = isDark ? "light" : "dark";

    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      aria-label="테마 전환"
      title="라이트/다크 모드 전환"
    >
      <Sun className="hidden dark:block" size={16} />
      <Moon className="dark:hidden" size={16} />
    </button>
  );
}
