'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="fixed top-4 right-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-white/10 dark:bg-[color:rgba(20,20,23,0.8)] dark:text-gray-200 dark:hover:bg-white/10"
      suppressHydrationWarning
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5 transition-transform" />
        ) : (
          <Moon className="h-5 w-5 transition-transform" />
        )
      ) : (
        <span className="block h-5 w-5" />
      )}
    </button>
  );
}
