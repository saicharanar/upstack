export function parseListParams(searchParams = {}) {
  // Normalize raw query params into a clean filter object:
  //   - q:    the search text, trimmed; "" if missing
  //   - sort: the sort value; default to "new" if missing
  //   - page: a number that is at least 1 (default 1 if missing or invalid)
  // Example: parseListParams({ q: '  react ', page: '3' })
  //          -> { q: 'react', sort: 'new', page: 3 }
  return { q: '', sort: 'new', page: 1 };
}

// A small preview — no need to change this.
export default function Preview() {
  const filter = parseListParams({ q: '  react ', page: '3' });
  return <pre>{JSON.stringify(filter)}</pre>;
}
