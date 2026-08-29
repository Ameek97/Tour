import { apiRequest } from './api';

export function getCurrentUser(options = {}) {
  return apiRequest('/api/user/me', options);
}

export function updatePassword({ passwordCurrent, password, passwordConfirm }) {
  return apiRequest('/api/user/updatePassword', {
    method: 'PATCH',
    body: { passwordCurrent, password, passwordConfirm }
  });
}

export function updateMe({ name, email, photo }) {
  const body = { name, email };
  if (photo !== undefined) {
    body.photo = photo;
  }
  return apiRequest('/api/user/updateMe', {
    method: 'PATCH',
    body
  });
}

export function deleteMe() {
  return apiRequest('/api/user/delete', {
    method: 'DELETE'
  });
}

export function forgotPassword({ email }) {
  return apiRequest('/api/user/forgotPassword', {
    method: 'POST',
    body: { email }
  });
}

export function resetPassword(token, { password, passwordConfirm }) {
  return apiRequest(`/api/user/resetPassword/${encodeURIComponent(token)}`, {
    method: 'PATCH',
    body: { password, passwordConfirm }
  });
}
