import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function App() {
  const boxRef = useRef(null);

  useGSAP(() => {
    // Use gsap.set to move the box 120px to the right (x: 120) and make it
    // half transparent (opacity: 0.5).
  });

  return (
    <div ref={boxRef} className="box" style={{ width: 80, height: 80, background: '#0b7a4b' }} />
  );
}
