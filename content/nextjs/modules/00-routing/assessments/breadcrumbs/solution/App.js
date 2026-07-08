export function toBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments.map((segment, index) => ({
    label: segment,
    href: '/' + segments.slice(0, index + 1).join('/'),
  }));
}

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
