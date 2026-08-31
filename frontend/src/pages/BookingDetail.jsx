import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBooking } from '../services/bookingService';
import {
  bookingTour,
  bookingUser,
  formatBookingDate,
  formatStatusLabel,
  httpCover
} from '../utils/bookingDisplay';

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBooking() {
      setLoading(true);
      setError('');
      setBooking(null);
      try {
        const data = await getBooking(id);
        if (!cancelled) {
          const next = data.data?.booking || null;
          setBooking(next);
          if (!next) {
            setError('Booking not found.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err.message || '';
          if (err.status === 404 || message.toLowerCase().includes('no document')) {
            setError('Booking not found.');
          } else if (err.status === 403) {
            setError(message || 'You are not authorised to view this booking.');
          } else {
            setError(message || 'Unable to load this booking.');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBooking();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const tour = bookingTour(booking);
  const owner = bookingUser(booking);
  const cover = tour ? httpCover(tour.imageCover) : null;
  const bookedOn = booking?.createdAt ? formatBookingDate(booking.createdAt) : null;

  return (
    <main className="page page-wide">
      <p>
        <Link to="/bookings">← Back to My Bookings</Link>
      </p>
      <h1>Booking details</h1>

      {loading ? <p className="status">Loading booking...</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error && booking ? (
        <article className="booking-card">
          {cover ? <img className="booking-card-image" src={cover} alt="" /> : null}
          <div className="booking-card-body">
            {tour?.name ? <h2>{tour.name}</h2> : null}
            {tour?.summary ? <p>{tour.summary}</p> : null}
            {owner?.name ? <p>Booked by: {owner.name}</p> : null}
            {booking.price != null ? <p>Price: ${booking.price}</p> : null}
            {booking.status ? (
              <p>
                Booking: {formatStatusLabel(booking.status)}
              </p>
            ) : null}
            {booking.paymentStatus ? (
              <p>
                Payment: {formatStatusLabel(booking.paymentStatus)}
              </p>
            ) : null}
            {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' ? (
              <p>Payment is not complete until it is confirmed by the server.</p>
            ) : null}
            {bookedOn ? <p>Booked on: {bookedOn}</p> : null}
            {Array.isArray(tour?.startDates) && tour.startDates.length > 0 ? (
              <p>
                Start dates:{' '}
                {tour.startDates
                  .map((value) => formatBookingDate(value) || String(value))
                  .join(', ')}
              </p>
            ) : null}
          </div>
        </article>
      ) : null}
    </main>
  );
}
