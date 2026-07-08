export function transitionFor(prefersReducedMotion) {
  return { duration: prefersReducedMotion ? 0 : 0.5 };
}

export default function Preview() {
  return <pre>{JSON.stringify(transitionFor(true))}</pre>;
}
