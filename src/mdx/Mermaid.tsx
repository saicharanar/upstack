'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

/**
 * Renders a Mermaid diagram from an inline text definition. Mermaid is heavy and
 * DOM-only, so it's imported lazily inside the effect — it only loads on chapters
 * that actually use a diagram, and never on the server.
 */
export function Mermaid({ chart, caption }: { chart: string; caption?: string }): ReactNode {
  const [svg, setSvg] = useState<string>('');
  const [failed, setFailed] = useState(false);
  const rawId = useId();
  const idRef = useRef(`mmd-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const dark =
          typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark';
        // htmlLabels renders labels as sized-to-content HTML (no clipping of long
        // edge/node labels, and wrapping works); requires securityLevel 'loose'.
        // Safe here because every chart is author-written app content, never user input.
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: dark ? 'dark' : 'neutral',
          flowchart: { htmlLabels: true, useMaxWidth: true, curve: 'basis' },
          fontFamily: 'inherit',
        });
        const { svg: rendered } = await mermaid.render(idRef.current, chart.trim());
        if (active) setSvg(rendered);
      } catch {
        if (active) setFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [chart]);

  if (failed) return null;

  return (
    <figure className="diagram diagram--mermaid">
      {svg ? (
        <div className="mermaid-diagram" role="img" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="mermaid-diagram mermaid-diagram--loading" aria-hidden="true" />
      )}
      {caption ? <figcaption className="diagram__caption">{caption}</figcaption> : null}
    </figure>
  );
}
