import { useState } from 'react';
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(<div className="modal">{children}</div>, document.body);
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
