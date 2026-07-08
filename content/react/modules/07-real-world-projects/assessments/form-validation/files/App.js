import { useState } from 'react';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // Validate on submit:
    //   - email must contain "@"      -> otherwise set errors.email = 'Enter a valid email'
    //   - password must be >= 8 chars -> otherwise set errors.password =
    //         'Password must be at least 8 characters'
    // Put the messages in `errors`. Only when BOTH are valid, mark the form done.
  }

  if (done) return <p>Account created!</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.email && <p className="error">{errors.email}</p>}
      <input
        aria-label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {errors.password && <p className="error">{errors.password}</p>}
      <button type="submit">Sign up</button>
    </form>
  );
}
