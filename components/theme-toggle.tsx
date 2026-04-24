'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
  compact?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size={compact ? 'icon' : 'default'}
        className={cn(
          compact ? 'h-10 w-10 disabled opacity-50' : 'w-full justify-start gap-2 disabled opacity-50',
          className
        )}
        disabled
        aria-label="Theme toggle"
      >
        <Sun className="h-4 w-4" />
        {!compact && <span>Theme</span>}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={compact ? 'icon' : 'default'}
      className={cn(compact ? 'h-10 w-10' : 'w-full justify-start gap-2', className)}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="h-4 w-4" />
          {!compact && <span>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          {!compact && <span>Dark Mode</span>}
        </>
      )}
    </Button>
  );
}
