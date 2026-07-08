export function parseListParams(searchParams = {}) {
  const q = (searchParams.q ?? '').trim();
  const sort = searchParams.sort ?? 'new';
  const parsed = Number.parseInt(searchParams.page, 10);
  const page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  return { q, sort, page };
}

export default function Preview() {
  const filter = parseListParams({ q: '  react ', page: '3' });
  return <pre>{JSON.stringify(filter)}</pre>;
}
