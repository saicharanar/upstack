import { useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState({ name: 'Ada Lovelace', role: 'member' });
  // Show the user's name and role (e.g. "Ada Lovelace — member").
  // A "Promote" button changes the role to 'admin'.
  return null;
}
