'use client';

import type { ReactNode } from 'react';
import { useThemeMode } from './useThemeMode';

function SunIcon(): ReactNode {
  return (
    <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </g>
    </svg>
  );
}

function MoonIcon(): ReactNode {
  return (
    <svg className="theme-toggle__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.2A8 8 0 0 1 9.8 4 8 8 0 1 0 20 14.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ThemeToggle(): ReactNode {
  const { mode, toggle } = useThemeMode();
  const nextLabel = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={nextLabel} title={nextLabel}>
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
