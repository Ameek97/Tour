const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers, skipUnauthorizedEvent = false } = options;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (err) {
    const error = new Error('Network request failed. Check your connection and try again.');
    error.status = 0;
    throw error;
  }

  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorizedEvent) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}
