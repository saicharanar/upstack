import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function App() {
  const scope = useRef(null);

  useGSAP(
    () => {
      gsap.set('.box', { x: (index) => index * 80 });
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
