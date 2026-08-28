import { apiRequest } from './api';

export function signup({ name, email, password, passwordConfirm }) {
  return apiRequest('/api/user/signup', {
    method: 'POST',
    body: { name, email, password, passwordConfirm }
  });
}

export function login({ email, password }) {
  return apiRequest('/api/user/login', {
    method: 'POST',
    body: { email, password }
  });
}

export function logout() {
  return apiRequest('/api/user/logout', { method: 'GET' });
}
