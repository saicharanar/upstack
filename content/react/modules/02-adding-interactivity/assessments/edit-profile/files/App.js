import { useState } from 'react';

export default function Profile() {
  // State is an object: { name: 'Ada Lovelace', role: 'member' }.
  //
  // 1. Show the name and role somewhere (e.g. "Ada Lovelace — member").
  // 2. A "Promote" button changes ONLY the role to 'admin', without mutating
  //    the old object. Copy it and override the one field:
  //      setUser({ ...user, role: 'admin' })
  const [user, setUser] = useState({ name: 'Ada Lovelace', role: 'member' });
  return null;
}
