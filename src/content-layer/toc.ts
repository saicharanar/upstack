export interface TocItem {
  readonly id: string;
  readonly text: string;
  readonly depth: 2 | 3;
}

const HEADING_PATTERN = /^(#{2,3})\s+(.+?)\s*#*$/;
const FENCE_PATTERN = /^\s*(```|~~~)/;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function reactChildrenToText(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(reactChildrenToText).join('');
  if (children && typeof children === 'object' && 'props' in children) {
    return reactChildrenToText((children as { props?: { children?: unknown } }).props?.children);
  }
  return '';
}

/** Pulls `##`/`###` headings from MDX source, skipping fenced code blocks. */
export function extractHeadings(source: string): TocItem[] {
  const items: TocItem[] = [];
  let insideFence = false;

  for (const line of source.split('\n')) {
    if (FENCE_PATTERN.test(line)) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = HEADING_PATTERN.exec(line);
    const hashes = match?.[1];
    const heading = match?.[2];
    if (!hashes || !heading) continue;

    const depth = hashes.length === 2 ? 2 : 3;
    const text = heading.trim();
    items.push({ id: slugify(text), text, depth });
  }

  return items;
}
