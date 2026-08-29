import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <p className="status">Loading...</p>;
  }

  if (user) {
    return <Navigate to="/tours" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/tours', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to log in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <h1>Login</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
      <p>
        Need an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
}
