import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { getManifest } from '@/content-layer/loader';
import { toNavModel } from '@/content-layer/nav';

export default async function ReadingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ stack: string }>;
}): Promise<ReactNode> {
  const { stack } = await params;
  const model = toNavModel(getManifest(stack));

  return (
    <div className="reading-shell">
      <Sidebar model={model} />
      <main className="reading-shell__main">{children}</main>
    </div>
  );
}
