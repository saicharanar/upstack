import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function App() {
  // Build a modal that opens on a click and renders THROUGH A PORTAL into
  // document.body (so it escapes the .app container):
  //   - an "Open" button that shows the modal
  //   - the modal is a <div className="modal"> containing the text
  //     "Settings saved!" and a "Close" button, rendered via createPortal
  //     into document.body
  //   - clicking "Close" hides it again
  return <div className="app"></div>;
}
