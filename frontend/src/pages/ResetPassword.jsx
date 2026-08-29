import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { resetPassword } from '../services/userService';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !passwordConfirm) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('This reset link is missing a token.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, { password, passwordConfirm });
      setPassword('');
      setPasswordConfirm('');
      setSuccess('Your password has been reset. You can now log in.');
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <h1>Reset password</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          New password
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            name="passwordConfirm"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
      <p>
        <Link to="/login">Go to login</Link>
      </p>
    </main>
  );
}
