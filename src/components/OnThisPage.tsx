'use client';

import { useEffect, useState, type ReactNode } from 'react';
import type { TocItem } from '@/content-layer/toc';

const OBSERVER_OPTIONS: IntersectionObserverInit = {
  rootMargin: '0px 0px -70% 0px',
  threshold: 0,
};

function firstInDocumentOrder(order: readonly string[], visible: ReadonlySet<string>): string | null {
  return order.find((id) => visible.has(id)) ?? null;
}

export function OnThisPage({ items }: { items: readonly TocItem[] }): ReactNode {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const order = items.map((item) => item.id);
    const visible = new Set<string>();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) visible.add(id);
        else visible.delete(id);
      });
      setActiveId((current) => firstInDocumentOrder(order, visible) ?? current);
    }, OBSERVER_OPTIONS);

    const elements = order
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="on-this-page" aria-label="On this page">
      <p className="on-this-page__label">On this page</p>
      <ul className="on-this-page__list">
        {items.map((item) => (
          <li key={item.id} className="on-this-page__item" data-depth={item.depth}>
            <a
              className="on-this-page__link"
              href={`#${item.id}`}
              data-active={item.id === activeId}
              aria-current={item.id === activeId ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
