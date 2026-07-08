import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function App() {
  const boxRef = useRef(null);

  useGSAP(() => {
    gsap.set(boxRef.current, { x: 120, opacity: 0.5 });
  });

  return (
    <div ref={boxRef} className="box" style={{ width: 80, height: 80, background: '#0b7a4b' }} />
  );
}
