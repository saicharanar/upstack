export function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

export default function Preview() {
  return <pre>mapRange(0.5, 0, 1, 0, 100) = {mapRange(0.5, 0, 1, 0, 100)}</pre>;
}
