import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { getManifest } from '@/content-layer/loader';
import { toNavModel } from '@/content-layer/nav';

export default function ReadingLayout({ children }: { children: ReactNode }): ReactNode {
  const model = toNavModel(getManifest());

  return (
    <div className="reading-shell">
      <Sidebar model={model} />
      <main className="reading-shell__main">{children}</main>
    </div>
  );
}
