import { useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ children }) {
  // Render the modal's markup into document.body with a portal, so it lands
  // OUTSIDE the app's own container. Keep it wrapped in <div className="modal">.
  return <div className="modal">{children}</div>;
}

export default function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app">
      <button onClick={() => setOpen(true)}>Open</button>
      {open && (
        <Modal>
          <p>Settings saved!</p>
          <button onClick={() => setOpen(false)}>Close</button>
        </Modal>
      )}
    </div>
  );
}
