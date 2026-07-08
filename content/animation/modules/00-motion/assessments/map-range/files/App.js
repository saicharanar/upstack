export function mapRange(value, inMin, inMax, outMin, outMax) {
  // Map `value` linearly from the input range [inMin, inMax] to the output
  // range [outMin, outMax].
  //   mapRange(0.5, 0, 1, 0, 100)   -> 50
  //   mapRange(0,   0, 1, 0, 100)   -> 0
  //   mapRange(50,  0, 100, 0, 1)   -> 0.5
  return 0;
}

// A small preview — no need to change this.
export default function Preview() {
  return <pre>mapRange(0.5, 0, 1, 0, 100) = {mapRange(0.5, 0, 1, 0, 100)}</pre>;
}
