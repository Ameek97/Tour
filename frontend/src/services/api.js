const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}
