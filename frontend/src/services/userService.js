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
