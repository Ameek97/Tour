import { apiRequest } from './api';

const DEFAULT_PAGE_SIZE = 6;

export function getTours({ minPrice, maxPrice, sort, page, limit }) {
  const search = new URLSearchParams();

  if (minPrice) {
    search.set('price[gte]', String(minPrice));
  }
  if (maxPrice) {
    search.set('price[lte]', String(maxPrice));
  }
  if (sort) {
    search.set('sort', sort);
  }

  const currentPage = page || 1;
  const pageSize = Number(limit) > 0 ? Number(limit) : DEFAULT_PAGE_SIZE;
  search.set('page', String(currentPage));
  search.set('limit', String(pageSize));

  const query = search.toString();
  return apiRequest(`/api/tour?${query}`);
}

export function getTourById(id) {
  return apiRequest(`/api/tour/${id}`);
}

export function getTourStats() {
  return apiRequest('/api/tour/tour-stats');
}

export function getTopCheapTours() {
  return apiRequest('/api/tour/top-5-cheap');
}

export function getToursWithin({ distance, lat, lng, unit }) {
  const safeUnit = unit === 'mi' ? 'mi' : 'km';
  const center = encodeURIComponent(`${lat},${lng}`);
  const dist = encodeURIComponent(String(distance));
  return apiRequest(`/api/tour/tours-within/${dist}/center/${center}/unit/${safeUnit}`);
}

export function createTour(body) {
  return apiRequest('/api/tour', {
    method: 'POST',
    body
  });
}

export function updateTour(id, body) {
  return apiRequest(`/api/tour/${id}`, {
    method: 'PATCH',
    body
  });
}

export function deleteTour(id) {
  return apiRequest(`/api/tour/delete/${id}`, {
    method: 'DELETE'
  });
}

export function deleteAllTours() {
  return apiRequest('/api/tour/delete', {
    method: 'DELETE'
  });
}

export function unwrapTour(data) {
  return data?.data?.tour || data?.Data?.Tour || null;
}

export { DEFAULT_PAGE_SIZE as PAGE_SIZE };
