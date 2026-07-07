import { useState } from 'react';

export default function LightSwitch() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <button onClick={() => setOn(!on)}>{on ? 'Turn off' : 'Turn on'}</button>
      {on && <p>💡 The light is on</p>}
    </div>
  );
}
