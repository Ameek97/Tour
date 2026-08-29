import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteMe, getCurrentUser, updateMe, updatePassword } from '../services/userService';

function isHttpUrl(value) {
  return Boolean(value && String(value).startsWith('http'));
}

export default function Profile() {
  const { refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  const [deleteError, setDeleteError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError('');
      try {
        const data = await getCurrentUser();
        if (!cancelled) {
          const user = data.data?.user || null;
          setProfile(user);
          setName(user?.name || '');
          setEmail(user?.email || '');
          setPhoto(user?.photo || '');
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

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (profileSubmitting) {
      return;
    }
    setProfileError('');
    setProfileSuccess('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhoto = photo.trim();

    if (!trimmedName) {
      setProfileError('Please enter a name.');
      return;
    }
    if (!trimmedEmail) {
      setProfileError('Please enter an email.');
      return;
    }

    setProfileSubmitting(true);
    try {
      const data = await updateMe({
        name: trimmedName,
        email: trimmedEmail,
        photo: trimmedPhoto
      });
      const updated = data.data?.user || null;
      if (updated) {
        setProfile(updated);
        setName(updated.name || '');
        setEmail(updated.email || '');
        setPhoto(updated.photo || '');
      }
      await refreshUser();
      setProfileSuccess('Profile updated.');
    } catch (err) {
      const message = err.message || 'Unable to update profile.';
      if (message.includes('E11000') || message.toLowerCase().includes('duplicate')) {
        setProfileError('That email is already in use.');
      } else {
        setProfileError(message);
      }
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    if (passwordSubmitting) {
      return;
    }
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordCurrent || !password || !passwordConfirm) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (password.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    if (password !== passwordConfirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
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
      setPasswordSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    const confirmed = window.confirm(
      'Delete your account? This cannot be undone. You will be signed out.'
    );
    if (!confirmed) {
      return;
    }

    setDeleteSubmitting(true);
    try {
      await deleteMe();
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete account.');
      setDeleteSubmitting(false);
    }
  }

  const photoSrc = isHttpUrl(profile?.photo) ? profile.photo : null;

  return (
    <main className="page">
      <h1>Profile</h1>

      {loading ? <p className="status">Loading profile...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error && !profile ? (
        <p>No profile information is available.</p>
      ) : null}

      {!loading && !error && profile ? (
        <>
          <section>
            <h2>Profile Information</h2>
            <div className="profile-card">
              {photoSrc ? (
                <img className="profile-photo" src={photoSrc} alt="" />
              ) : null}
              <p>
                <strong>Role:</strong> {profile.role || '—'}
              </p>
              {!photoSrc && profile.photo ? (
                <p>
                  <strong>Photo:</strong> {profile.photo}
                </p>
              ) : null}
            </div>

            <form className="form" onSubmit={handleProfileSubmit}>
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={profileSubmitting}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={profileSubmitting}
                />
              </label>
              <label>
                Photo
                <input
                  type="text"
                  name="photo"
                  value={photo}
                  onChange={(event) => setPhoto(event.target.value)}
                  disabled={profileSubmitting}
                />
              </label>
              {profileError ? <p className="error">{profileError}</p> : null}
              {profileSuccess ? <p className="success">{profileSuccess}</p> : null}
              <button type="submit" disabled={profileSubmitting}>
                {profileSubmitting ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </section>

          <section>
            <h2>Security</h2>
            <form className="form" onSubmit={handlePasswordSubmit}>
              <label>
                Current password
                <input
                  type="password"
                  name="passwordCurrent"
                  autoComplete="current-password"
                  value={passwordCurrent}
                  onChange={(event) => setPasswordCurrent(event.target.value)}
                  disabled={passwordSubmitting}
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
                  disabled={passwordSubmitting}
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
                  disabled={passwordSubmitting}
                />
              </label>
              {passwordError ? <p className="error">{passwordError}</p> : null}
              {passwordSuccess ? <p className="success">{passwordSuccess}</p> : null}
              <button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </section>

          <section>
            <h2>Account</h2>
            <div className="profile-card account-danger">
              <p>Deleting your account is permanent. This is not logout.</p>
              {deleteError ? <p className="error">{deleteError}</p> : null}
              <button
                type="button"
                className="danger-button"
                disabled={deleteSubmitting}
                onClick={handleDeleteAccount}
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete account'}
              </button>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
