import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { ProgressProvider } from '@/progress/ProgressProvider';
import { ThemeToggle } from '@/theme/ThemeToggle';
import { THEME_BOOTSTRAP_SCRIPT } from '@/theme/themeStorage';

export const metadata: Metadata = {
  title: 'upstack — learn a stack, one concept at a time',
  description: 'A progressive, hands-on learning platform with graded in-browser exercises.',
};

export default function RootLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>
        <ProgressProvider>
          <header className="app-header">
            <Link className="app-header__brand" href="/">
              upstack
            </Link>
            <div className="app-header__actions">
              <ThemeToggle />
              <Link className="button button--ghost" href="/learn/react">
                Open course
              </Link>
            </div>
          </header>
          {children}
        </ProgressProvider>
      </body>
    </html>
  );
}
