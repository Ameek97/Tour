import { apiRequest } from './api';

export function createBooking(tourId) {
  return apiRequest('/api/booking', {
    method: 'POST',
    body: { tour: tourId }
  });
}

export function getMyBookings() {
  return apiRequest('/api/booking/my-bookings');
}

export function getAllBookings() {
  return apiRequest('/api/booking');
}

export function updateBookingStatus(id, status) {
  return apiRequest(`/api/booking/${id}`, {
    method: 'PATCH',
    body: { status }
  });
}

export function deleteBooking(id) {
  return apiRequest(`/api/booking/${id}`, {
    method: 'DELETE'
  });
}
