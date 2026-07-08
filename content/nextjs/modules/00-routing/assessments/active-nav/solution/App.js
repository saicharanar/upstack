const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function Nav({ pathname = '/blog' }) {
  return (
    <nav>
      {links.map((link) => (
        <a key={link.href} href={link.href} aria-current={link.href === pathname ? 'page' : undefined}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
