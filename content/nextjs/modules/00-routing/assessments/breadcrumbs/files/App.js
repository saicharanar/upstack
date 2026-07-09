export function toBreadcrumbs(pathname) {
  // Turn a path like "/blog/react/hooks" into breadcrumb items:
  //   [ { label: 'blog',  href: '/blog' },
  //     { label: 'react', href: '/blog/react' },
  //     { label: 'hooks', href: '/blog/react/hooks' } ]
  // Split on "/", ignore empty segments, and build the cumulative href for each.
  // The root path "/" has no segments, so it returns an empty array.
  return [{ label: '?', href: '/' }];
}

// A small preview — no need to change this.
export default function Breadcrumbs({ pathname = '/blog/react/hooks' }) {
  const items = toBreadcrumbs(pathname);
  return (
    <nav>
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
