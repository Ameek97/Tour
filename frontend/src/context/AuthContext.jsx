import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onUnauthorized() {
      setUser(null);
    }
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  async function login(email, password) {
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      setUser({ email });
    } finally {
      setLoading(false);
    }
  }

  async function signup(form) {
    setError('');
    setLoading(true);
    try {
      await authService.signup({
        name: form.name,
        email: form.email,
        password: form.password,
        passwordConfirm: form.passwordConfirm
      });
      setUser({ name: form.name, email: form.email });
    } finally {
      setLoading(false);
    }
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
