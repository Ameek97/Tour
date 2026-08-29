import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';
import { getCurrentUser } from '../services/userService';

const AuthContext = createContext(null);

function userFromMeResponse(data) {
  const raw = data?.data?.user;
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const user = {};
  if (raw.id != null) {
    user.id = raw.id;
  }
  if (raw.name != null) {
    user.name = raw.name;
  }
  if (raw.email != null) {
    user.email = raw.email;
  }
  if (raw.role != null) {
    user.role = raw.role;
  }
  if (raw.photo != null) {
    user.photo = raw.photo;
  }

  return Object.keys(user).length ? user : null;
}

async function loadCurrentUser({ skipUnauthorizedEvent } = {}) {
  const data = await getCurrentUser(
    skipUnauthorizedEvent ? { skipUnauthorizedEvent: true } : {}
  );
  return userFromMeResponse(data);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      setLoading(true);
      try {
        const current = await loadCurrentUser({ skipUnauthorizedEvent: true });
        if (!cancelled) {
          setUser(current);
        }
      } catch (err) {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  async function login(email, password) {
    setError('');
    await authService.login({ email, password });
    const current = await loadCurrentUser();
    setUser(current);
  }

  async function signup(form) {
    setError('');
    await authService.signup({
      name: form.name,
      email: form.email,
      password: form.password,
      passwordConfirm: form.passwordConfirm
    });
    const current = await loadCurrentUser();
    setUser(current);
  }

  async function logout() {
    setError('');
    try {
      await authService.logout();
    } catch (err) {
      // Always clear local UI state even if the logout request fails.
    }
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
