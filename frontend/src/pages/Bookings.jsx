import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/bookingService';
import {
  bookingTour,
  formatBookingDate,
  formatStatusLabel,
  httpCover
} from '../utils/bookingDisplay';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyBookings();
        if (!cancelled) {
          setBookings(Array.isArray(data.data?.bookings) ? data.data.bookings : []);
        }
      } catch (err) {
        if (!cancelled) {
          setBookings([]);
          setError(err.message || 'Unable to load bookings.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="page page-wide">
      <h1>My Bookings</h1>
      {loading ? <p className="status">Loading bookings...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      {!loading && !error && bookings.length === 0 ? (
        <p>
          You have no bookings yet. Explore available tours.{' '}
          <Link to="/tours">Explore tours</Link>
        </p>
      ) : null}
      {!loading && !error && bookings.length > 0 ? (
        <ul className="booking-list">
          {bookings.map((booking) => {
            const tour = bookingTour(booking);
            const cover = tour ? httpCover(tour.imageCover) : null;
            const bookedOn = booking.createdAt ? formatBookingDate(booking.createdAt) : null;
            return (
              <li key={booking._id} className="booking-card">
                {cover ? <img className="booking-card-image" src={cover} alt="" /> : null}
                <div className="booking-card-body">
                  {tour?.name ? <h2>{tour.name}</h2> : null}
                  {tour?.summary ? <p>{tour.summary}</p> : null}
                  {booking.price != null ? <p>Price: ${booking.price}</p> : null}
                  {booking.status ? (
                    <p>Booking: {formatStatusLabel(booking.status)}</p>
                  ) : null}
                  {booking.paymentStatus ? (
                    <p>Payment: {formatStatusLabel(booking.paymentStatus)}</p>
                  ) : null}
                  {booking.paymentStatus === 'pending' && booking.status !== 'cancelled' ? (
                    <p>Payment is not complete until it is confirmed by the server.</p>
                  ) : null}
                  {bookedOn ? <p>Booked on: {bookedOn}</p> : null}
                  <p>
                    <Link to={`/bookings/${booking._id}`}>View details</Link>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
