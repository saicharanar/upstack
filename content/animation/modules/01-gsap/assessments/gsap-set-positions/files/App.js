import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function App() {
  const scope = useRef(null);

  useGSAP(
    () => {
      // Use gsap.set on the ".box" elements with a FUNCTION-BASED value so each
      // box sits 80px further right than the last: box 0 → x 0, box 1 → x 80,
      // box 2 → x 160, box 3 → x 240.
    },
    { scope },
  );

  return (
    <div ref={scope} style={{ display: 'flex' }}>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="box" style={{ width: 40, height: 40, background: '#0b7a4b' }} />
      ))}
    </div>
  );
}
