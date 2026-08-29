import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/userService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await forgotPassword({ email: trimmed });
      setSuccess(
        data.message ||
          'If that account exists, the password-reset process has been initiated. Check your email.'
      );
    } catch (err) {
      setError(err.message || 'Unable to start password reset.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <h1>Forgot password</h1>
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
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send reset email'}
        </button>
      </form>
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </main>
  );
}
