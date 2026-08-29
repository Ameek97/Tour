import { apiRequest } from './api';

export function getReviewsByTour(tourId) {
  return apiRequest(`/api/tour/${tourId}/reviews`);
}

export function createReview(tourId, { review, rating }) {
  return apiRequest(`/api/tour/${tourId}/reviews`, {
    method: 'POST',
    body: { review, rating }
  });
}

export function deleteReview(tourId, reviewId) {
  return apiRequest(`/api/tour/${tourId}/reviews/${reviewId}`, {
    method: 'DELETE'
  });
}
