import type { MDXComponents } from 'mdx/types';
import type { ReactNode } from 'react';
import { LaunchAssessmentCard } from '@/assessment/LaunchAssessmentCard';
import { LiveExample } from '@/assessment/LiveExample';
import { Mermaid } from './Mermaid';
import { reactChildrenToText, slugify } from '@/content-layer/toc';

const CALLOUT_TYPES = ['note', 'tip', 'warning', 'important'] as const;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
type CalloutType = (typeof CALLOUT_TYPES)[number];

// npm packages a stack's live examples can import without declaring them each time.
const STACK_DEPENDENCIES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  animation: { motion: '^12', gsap: '^3', '@gsap/react': '^2' },
};

function withBasePath(src: string | Blob | undefined): string | Blob | undefined {
  if (typeof src !== 'string') return src;
  if (!src || !src.startsWith('/')) return src;
  return `${BASE_PATH}${src}`;
}

function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <aside className="callout" data-type={type}>
      {title ? <p className="callout__title">{title}</p> : null}
      <div className="callout__body">{children}</div>
    </aside>
  );
}

function Example({ title, children }: { title?: string; children: ReactNode }): ReactNode {
  return (
    <figure className="example">
      {title ? <figcaption className="example__title">{title}</figcaption> : null}
      <div className="example__body">{children}</div>
    </figure>
  );
}

function Diagram({ src, alt, caption }: { src: string; alt: string; caption?: string }): ReactNode {
  if (!alt) throw new Error(`<Diagram src="${src}"> is missing required alt text.`);

  return (
    <figure className="diagram">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="diagram__img" src={withBasePath(src)} alt={alt} loading="lazy" />
      {caption ? <figcaption className="diagram__caption">{caption}</figcaption> : null}
    </figure>
  );
}

function Image(props: React.ComponentProps<'img'>): ReactNode {
  return <img {...props} src={withBasePath(props.src)} />;
}

function Heading2({ children }: { children: ReactNode }): ReactNode {
  return <h2 id={slugify(reactChildrenToText(children))}>{children}</h2>;
}

function Heading3({ children }: { children: ReactNode }): ReactNode {
  return <h3 id={slugify(reactChildrenToText(children))}>{children}</h3>;
}

export function createMdxComponents(
  chapterId: string,
  moduleId: string,
  stack: string,
): MDXComponents {
  return {
    h2: Heading2,
    h3: Heading3,
    img: Image,
    Callout,
    Example,
    Diagram,
    Mermaid,
    LiveExample: ({
      dependencies,
      ...rest
    }: React.ComponentProps<typeof LiveExample>) => (
      <LiveExample
        dependencies={{ ...STACK_DEPENDENCIES[stack], ...dependencies }}
        {...rest}
      />
    ),
    Assessment: ({ id }: { id: string }) => (
      <LaunchAssessmentCard assessmentId={id} chapterId={chapterId} moduleId={moduleId} stack={stack} />
    ),
  };
}
