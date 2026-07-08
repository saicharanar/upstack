export function transitionFor(prefersReducedMotion) {
  // Return the transition to use:
  //   - when the user prefers reduced motion → instant: { duration: 0 }
  //   - otherwise → { duration: 0.5 }
  return { duration: 0.5 };
}

// A small preview — no need to change this.
export default function Preview() {
  return <pre>{JSON.stringify(transitionFor(true))}</pre>;
}
