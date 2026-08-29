import { useEffect, useState } from 'react';
import { getCurrentUser, updatePassword } from '../services/userService';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const data = await getCurrentUser();
        if (!cancelled) {
          setProfile(data.data?.user || null);
        }
      } catch (err) {
        if (!cancelled) {
          setProfile(null);
          setError(err.message || 'Unable to load profile.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordCurrent || !password || !passwordConfirm) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword({ passwordCurrent, password, passwordConfirm });
      setPasswordCurrent('');
      setPassword('');
      setPasswordConfirm('');
      setPasswordSuccess(
        'Password updated. Log out and log in again with your new password.'
      );
    } catch (err) {
      setPasswordError(err.message || 'Unable to update password.');
    } finally {
      setSubmitting(false);
    }
  }

  const photoSrc =
    profile?.photo && String(profile.photo).startsWith('http')
      ? profile.photo
      : null;

  return (
    <main className="page">
      <h1>Profile</h1>

      {loading ? <p className="status">Loading profile...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error && !profile ? (
        <p>No profile information is available.</p>
      ) : null}

      {!loading && !error && profile ? (
        <section className="profile-card">
          {photoSrc ? (
            <img className="profile-photo" src={photoSrc} alt="" />
          ) : null}
          <p>
            <strong>Name:</strong> {profile.name || '—'}
          </p>
          <p>
            <strong>Email:</strong> {profile.email || '—'}
          </p>
          <p>
            <strong>Role:</strong> {profile.role || '—'}
          </p>
          {!photoSrc && profile.photo ? (
            <p>
              <strong>Photo:</strong> {profile.photo}
            </p>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2>Change password</h2>
        <form className="form" onSubmit={handlePasswordSubmit}>
          <label>
            Current password
            <input
              type="password"
              name="passwordCurrent"
              autoComplete="current-password"
              value={passwordCurrent}
              onChange={(event) => setPasswordCurrent(event.target.value)}
            />
          </label>
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
          {passwordError ? <p className="error">{passwordError}</p> : null}
          {passwordSuccess ? <p className="success">{passwordSuccess}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </section>
    </main>
  );
}
