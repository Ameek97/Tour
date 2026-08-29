import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/bookingService';
import { createReview, deleteReview, getReviewsByTour } from '../services/reviewService';
import { getTourById } from '../services/tourService';

function httpImages(tour) {
  const urls = [];
  if (tour.imageCover && String(tour.imageCover).startsWith('http')) {
    urls.push(tour.imageCover);
  }
  if (Array.isArray(tour.images)) {
    tour.images.forEach((src) => {
      if (src && String(src).startsWith('http') && !urls.includes(src)) {
        urls.push(src);
      }
    });
  }
  return urls;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString();
}

function reviewerName(user) {
  if (!user) {
    return null;
  }
  if (typeof user === 'string') {
    return user;
  }
  if (typeof user === 'object' && user.name) {
    return user.name;
  }
  return null;
}

function starLabel(rating) {
  if (typeof rating !== 'number' || Number.isNaN(rating)) {
    return null;
  }
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

export default function TourDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadTour() {
      setLoading(true);
      setError('');
      setTour(null);
      try {
        const data = await getTourById(id);
        if (!cancelled) {
          setTour(data.data?.tour || null);
          if (!data.data?.tour) {
            setError('Tour not found.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.message || '';
          if (
            err.status === 404 ||
            message.toLowerCase().includes('no document') ||
            message.includes('Cast to ObjectId')
          ) {
            setError('Tour not found.');
          } else {
            setError(message || 'Unable to load this tour.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTour();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function refreshReviews() {
    const data = await getReviewsByTour(id);
    const list = Array.isArray(data.reviews) ? data.reviews : [];
    setReviews(list);
    setReviewCount(typeof data.result === 'number' ? data.result : list.length);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError('');
      setReviews([]);
      setReviewCount(null);
      try {
        const data = await getReviewsByTour(id);
        if (!cancelled) {
          const list = Array.isArray(data.reviews) ? data.reviews : [];
          setReviews(list);
          setReviewCount(
            typeof data.result === 'number' ? data.result : list.length
          );
        }
      } catch (err) {
        if (!cancelled) {
          setReviews([]);
          setReviewCount(null);
          setReviewsError('Unable to load reviews.');
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    loadReviews();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleReviewSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const trimmed = reviewText.trim();
    const ratingNumber = Number(rating);

    if (!trimmed) {
      setFormError('Please enter a review.');
      return;
    }
    if (!rating || Number.isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      setFormError('Please choose a rating from 1 to 5.');
      return;
    }

    setSubmitting(true);
    try {
      await createReview(id, { review: trimmed, rating: ratingNumber });
      setReviewText('');
      setRating('');
      setFormSuccess('Review submitted.');
      await refreshReviews();
    } catch (err) {
      setFormError(err.message || 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReview(reviewId) {
    setDeleteError('');
    setDeleteSuccess('');
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingId(reviewId);
    try {
      await deleteReview(id, reviewId);
      setReviews((current) => current.filter((item) => item._id !== reviewId));
      setReviewCount((current) =>
        typeof current === 'number' ? Math.max(0, current - 1) : current
      );
      setDeleteSuccess('Review deleted.');
    } catch (err) {
      setDeleteError(err.message || 'Unable to delete this review.');
    } finally {
      setDeletingId('');
    }
  }

  async function handleBookTour(event) {
    event.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingSubmitting(true);
    try {
      await createBooking(id);
      setBookingSuccess('Tour booked successfully.');
    } catch (err) {
      setBookingError(err.message || 'Unable to book this tour.');
    } finally {
      setBookingSubmitting(false);
    }
  }

  const images = tour ? httpImages(tour) : [];
  const startPlace =
    tour?.startLocation?.description || tour?.startLocation?.address || null;
  const extraLocations = Array.isArray(tour?.locations)
    ? tour.locations
        .map((loc) => loc.description || loc.address)
        .filter(Boolean)
    : [];
  const guideNames = Array.isArray(tour?.guides)
    ? tour.guides
        .map((guide) => (typeof guide === 'object' ? guide.name : null))
        .filter(Boolean)
    : [];

  return (
    <main className="page page-wide">
      <p>
        <Link to="/tours">← Back to Tours</Link>
      </p>

      {loading ? <p className="status">Loading tour...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error && tour ? (
        <article className="tour-details">
          <h1>{tour.name}</h1>

          {images.length > 0 ? (
            <div className="tour-details-images">
              {images.map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          ) : null}

          {tour.summary ? <p>{tour.summary}</p> : null}

          <ul className="tour-details-facts">
            {tour.price != null ? <li>Price: ${tour.price}</li> : null}
            {tour.ratingAverage != null ? (
              <li>Average rating: {tour.ratingAverage}</li>
            ) : null}
            {tour.rating != null ? <li>Rating: {tour.rating}</li> : null}
            {startPlace ? <li>Start location: {startPlace}</li> : null}
            {extraLocations.length > 0 ? (
              <li>Locations: {extraLocations.join(', ')}</li>
            ) : null}
            {Array.isArray(tour.startDates) && tour.startDates.length > 0 ? (
              <li>Start dates: {tour.startDates.map(formatDate).join(', ')}</li>
            ) : null}
            {guideNames.length > 0 ? <li>Guides: {guideNames.join(', ')}</li> : null}
          </ul>
        </article>
      ) : null}

      <section className="reviews">
        <h2>
          Reviews
          {reviewCount != null ? ` (${reviewCount})` : null}
        </h2>
        {reviewsLoading ? <p className="status">Loading reviews...</p> : null}
        {reviewsError ? <p className="error">{reviewsError}</p> : null}
        {deleteError ? <p className="error">{deleteError}</p> : null}
        {deleteSuccess ? <p className="success">{deleteSuccess}</p> : null}
        {!reviewsLoading && !reviewsError && reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : null}
        {!reviewsLoading && !reviewsError && reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((item) => {
              const name = reviewerName(item.user);
              const stars = starLabel(item.rating);
              const date = item.createdAt ? formatDate(item.createdAt) : null;
              return (
                <li key={item._id} className="review-card">
                  {name ? <p className="review-author">{name}</p> : null}
                  {stars ? (
                    <p className="review-rating" aria-label={`Rating ${item.rating} of 5`}>
                      {stars}
                    </p>
                  ) : null}
                  {item.review ? <p>{item.review}</p> : null}
                  {date ? <p className="review-date">{date}</p> : null}
                  {user ? (
                    <button
                      type="button"
                      className="review-delete"
                      disabled={deletingId === item._id}
                      onClick={() => handleDeleteReview(item._id)}
                    >
                      {deletingId === item._id ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {user ? (
          <div className="review-form-section">
            <h3>Write a review</h3>
            <form className="form" onSubmit={handleReviewSubmit}>
              <label>
                Rating
                <select
                  name="rating"
                  value={rating}
                  onChange={(event) => setRating(event.target.value)}
                >
                  <option value="">Select rating</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </label>
              <label>
                Review
                <textarea
                  name="review"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                />
              </label>
              {formError ? <p className="error">{formError}</p> : null}
              {formSuccess ? <p className="success">{formSuccess}</p> : null}
              <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <p className="review-form-section">
            <Link to="/login">Log in</Link> to write a review.
          </p>
        )}
      </section>

      <section className="booking-section">
        <h2>Book This Tour</h2>
        {user ? (
          <form className="form" onSubmit={handleBookTour}>
            {tour && tour.price != null ? (
              <p>Price: ${tour.price}</p>
            ) : null}
            {bookingError ? <p className="error">{bookingError}</p> : null}
            {bookingSuccess ? (
              <p className="success">
                {bookingSuccess} <Link to="/bookings">View your bookings</Link>
              </p>
            ) : null}
            <button type="submit" disabled={bookingSubmitting}>
              {bookingSubmitting ? 'Booking...' : 'Book Tour'}
            </button>
          </form>
        ) : (
          <p>
            <Link to="/login">Log in</Link> to book this tour.
          </p>
        )}
      </section>
    </main>
  );
}
