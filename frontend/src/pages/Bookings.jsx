import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/bookingService';

function formatBookedOn(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function httpCover(src) {
  if (src && String(src).startsWith('http')) {
    return src;
  }
  return null;
}

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
          You haven&apos;t booked any tours yet.{' '}
          <Link to="/tours">Explore Tours</Link>
        </p>
      ) : null}
      {!loading && !error && bookings.length > 0 ? (
        <ul className="booking-list">
          {bookings.map((booking) => {
            const tour = booking.tour && typeof booking.tour === 'object' ? booking.tour : null;
            const cover = tour ? httpCover(tour.imageCover) : null;
            const bookedOn = booking.createdAt ? formatBookedOn(booking.createdAt) : null;
            return (
              <li key={booking._id} className="booking-card">
                {cover ? <img className="booking-card-image" src={cover} alt="" /> : null}
                <div className="booking-card-body">
                  {tour?.name ? <h2>{tour.name}</h2> : null}
                  {tour?.summary ? <p>{tour.summary}</p> : null}
                  {booking.price != null ? <p>Price: ${booking.price}</p> : null}
                  {booking.status ? <p>Booking status: {booking.status}</p> : null}
                  {booking.paymentStatus ? (
                    <p>Payment status: {booking.paymentStatus}</p>
                  ) : null}
                  {bookedOn ? <p>Booked on: {bookedOn}</p> : null}
                  {Array.isArray(tour?.startDates) && tour.startDates.length > 0 ? (
                    <p>
                      Start dates:{' '}
                      {tour.startDates
                        .map((value) => formatBookedOn(value) || String(value))
                        .join(', ')}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </main>
  );
}
