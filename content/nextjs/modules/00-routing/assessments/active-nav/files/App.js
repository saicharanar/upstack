const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
];

export default function Nav({ pathname = '/blog' }) {
  // Render one <a> per link. Mark the link whose href matches `pathname` as the
  // active one by giving it aria-current="page" (the others get nothing).
  return <nav></nav>;
}
