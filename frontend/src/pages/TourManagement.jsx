import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  deleteBooking,
  getAllBookings,
  updateBookingStatus
} from '../services/bookingService';
import {
  createTour,
  deleteAllTours,
  deleteTour,
  getTourById,
  getTours,
  updateTour
} from '../services/tourService';

const EMPTY_FORM = {
  name: '',
  price: '',
  summary: '',
  imageCover: '',
  imagesText: '',
  rating: '',
  ratingAverage: '',
  startLng: '',
  startLat: '',
  startAddress: '',
  startDescription: '',
  locLng: '',
  locLat: '',
  locAddress: '',
  locDescription: '',
  guidesText: '',
  startDatesText: ''
};

const OBJECT_ID = /^[a-fA-F0-9]{24}$/;
const LIST_LIMIT = 12;
const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled'];

function parseNumber(raw, label) {
  const text = String(raw).trim();
  if (text === '') {
    return { empty: true };
  }
  const value = Number(text);
  if (!Number.isFinite(value)) {
    return { error: `${label} must be a valid number.` };
  }
  return { value };
}

function parseCoordinatePair(lngRaw, latRaw, label) {
  const lngText = String(lngRaw).trim();
  const latText = String(latRaw).trim();
  if (lngText === '' && latText === '') {
    return { empty: true };
  }
  if (lngText === '' || latText === '') {
    return { error: `${label} needs both longitude and latitude.` };
  }
  const lng = Number(lngText);
  const lat = Number(latText);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return { error: `${label} coordinates must be numbers.` };
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: `${label} latitude must be between -90 and 90, longitude between -180 and 180.` };
  }
  return { lng, lat };
}

function splitList(text) {
  return String(text)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function guideIdsFromTour(guides) {
  if (!Array.isArray(guides)) {
    return [];
  }
  return guides
    .map((guide) => {
      if (typeof guide === 'string') {
        return guide;
      }
      if (guide && guide._id) {
        return String(guide._id);
      }
      return '';
    })
    .filter(Boolean);
}

function datesFromTour(dates) {
  if (!Array.isArray(dates)) {
    return '';
  }
  return dates
    .map((value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().slice(0, 10);
    })
    .filter(Boolean)
    .join(', ');
}

function buildPayload(form, { requireCover }) {
  const name = form.name.trim();
  const summary = form.summary.trim();
  const imageCover = form.imageCover.trim();
  if (!name || form.price === '' || !summary) {
    return { error: 'Name, price, and summary are required.' };
  }
  if (requireCover && !imageCover) {
    return { error: 'Image cover is required.' };
  }

  const priceParsed = parseNumber(form.price, 'Price');
  if (priceParsed.empty || priceParsed.error) {
    return { error: priceParsed.error || 'Price is required.' };
  }
  if (priceParsed.value < 0) {
    return { error: 'Price cannot be negative.' };
  }

  const body = {
    name,
    price: priceParsed.value,
    summary
  };
  if (imageCover) {
    body.imageCover = imageCover;
  }

  const images = splitList(form.imagesText);
  if (images.length) {
    body.images = images;
  }

  const ratingParsed = parseNumber(form.rating, 'Rating');
  if (ratingParsed.error) {
    return { error: ratingParsed.error };
  }
  if (!ratingParsed.empty) {
    body.rating = ratingParsed.value;
  }

  const avgParsed = parseNumber(form.ratingAverage, 'Average rating');
  if (avgParsed.error) {
    return { error: avgParsed.error };
  }
  if (!avgParsed.empty) {
    body.ratingAverage = avgParsed.value;
  }

  const start = parseCoordinatePair(form.startLng, form.startLat, 'Start location');
  if (start.error) {
    return { error: start.error };
  }
  if (requireCover && start.empty) {
    return { error: 'Start location longitude and latitude are required.' };
  }
  if (!start.empty) {
    const startLocation = {
      type: 'Point',
      coordinates: [start.lng, start.lat]
    };
    if (form.startAddress.trim()) {
      startLocation.address = form.startAddress.trim();
    }
    if (form.startDescription.trim()) {
      startLocation.description = form.startDescription.trim();
    }
    body.startLocation = startLocation;
  }

  const extra = parseCoordinatePair(form.locLng, form.locLat, 'Additional location');
  if (extra.error) {
    return { error: extra.error };
  }
  if (!extra.empty) {
    const location = {
      type: 'Point',
      coordinates: [extra.lng, extra.lat]
    };
    if (form.locAddress.trim()) {
      location.address = form.locAddress.trim();
    }
    if (form.locDescription.trim()) {
      location.description = form.locDescription.trim();
    }
    body.locations = [location];
  }

  const guides = splitList(form.guidesText);
  if (guides.some((id) => !OBJECT_ID.test(id))) {
    return { error: 'Guides must be comma-separated 24-character IDs.' };
  }
  if (guides.length) {
    body.guides = guides;
  }

  const dateParts = splitList(form.startDatesText);
  if (dateParts.length) {
    const startDates = [];
    for (const part of dateParts) {
      const date = new Date(part);
      if (Number.isNaN(date.getTime())) {
        return { error: 'Start dates must be valid dates (YYYY-MM-DD).' };
      }
      startDates.push(date.toISOString());
    }
    body.startDates = startDates;
  }

  return { body };
}

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString();
}

function nestedName(value) {
  if (value && typeof value === 'object') {
    return value.name || value.email || '—';
  }
  return '—';
}

function nestedEmail(value) {
  if (value && typeof value === 'object' && value.email) {
    return value.email;
  }
  return '—';
}

function formFromTour(tour) {
  const coords = tour.startLocation?.coordinates;
  const extra = Array.isArray(tour.locations) && tour.locations[0] ? tour.locations[0] : null;
  const extraCoords = extra?.coordinates;
  return {
    name: tour.name || '',
    price: tour.price != null ? String(tour.price) : '',
    summary: tour.summary || '',
    imageCover: tour.imageCover || '',
    imagesText: Array.isArray(tour.images) ? tour.images.join(', ') : '',
    rating: tour.rating != null ? String(tour.rating) : '',
    ratingAverage: tour.ratingAverage != null ? String(tour.ratingAverage) : '',
    startLng: Array.isArray(coords) && coords[0] != null ? String(coords[0]) : '',
    startLat: Array.isArray(coords) && coords[1] != null ? String(coords[1]) : '',
    startAddress: tour.startLocation?.address || '',
    startDescription: tour.startLocation?.description || '',
    locLng: Array.isArray(extraCoords) && extraCoords[0] != null ? String(extraCoords[0]) : '',
    locLat: Array.isArray(extraCoords) && extraCoords[1] != null ? String(extraCoords[1]) : '',
    locAddress: extra?.address || '',
    locDescription: extra?.description || '',
    guidesText: guideIdsFromTour(tour.guides).join(', '),
    startDatesText: datesFromTour(tour.startDates)
  };
}

export default function TourManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tours, setTours] = useState([]);
  const [page, setPage] = useState(1);
  const [resultCount, setResultCount] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [deletingAll, setDeletingAll] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [bookingActionError, setBookingActionError] = useState('');
  const [bookingActionSuccess, setBookingActionSuccess] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState('');
  const [deletingBookingId, setDeletingBookingId] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setListLoading(true);
      setListError('');
      try {
        const data = await getTours({ page, limit: LIST_LIMIT, sort: 'name' });
        if (!cancelled) {
          setTours(data.data?.tours || []);
          setResultCount(Number(data.result) || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setTours([]);
          setResultCount(0);
          setListError(err.message || 'Unable to load tours.');
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function loadBookings() {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const data = await getAllBookings();
      setBookings(Array.isArray(data.data?.bookings) ? data.data.bookings : []);
    } catch (err) {
      setBookings([]);
      setBookingsError(err.message || 'Unable to load bookings.');
    } finally {
      setBookingsLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');
    const built = buildPayload(form, { requireCover: !editingId });
    if (built.error) {
      setFormError(built.error);
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateTour(editingId, built.body);
        setFormSuccess('Tour updated successfully.');
        const listed = await getTours({ page, limit: LIST_LIMIT, sort: 'name' });
        setTours(listed.data?.tours || []);
        setResultCount(Number(listed.result) || 0);
      } else {
        await createTour(built.body);
        setFormSuccess('Tour created successfully.');
        setForm(EMPTY_FORM);
        setPage(1);
        const data = await getTours({ page: 1, limit: LIST_LIMIT, sort: 'name' });
        setTours(data.data?.tours || []);
        setResultCount(Number(data.result) || 0);
      }
    } catch (err) {
      setFormError(err.message || 'Unable to save tour.');
    } finally {
      setSubmitting(false);
    }
  }

  async function startEdit(tourId) {
    setActionError('');
    setFormError('');
    setFormSuccess('');
    try {
      const data = await getTourById(tourId);
      const tour = data.data?.tour;
      if (!tour) {
        setActionError('Unable to load that tour.');
        return;
      }
      setEditingId(tour._id);
      setForm(formFromTour(tour));
    } catch (err) {
      setActionError(err.message || 'Unable to load that tour.');
    }
  }

  function cancelEdit() {
    setEditingId('');
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
  }

  async function handleDelete(tourId) {
    if (!window.confirm('Delete this tour? This cannot be undone.')) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    setDeletingId(tourId);
    try {
      await deleteTour(tourId);
      setTours((current) => current.filter((tour) => tour._id !== tourId));
      setActionSuccess('Tour deleted.');
      if (editingId === tourId) {
        cancelEdit();
      }
    } catch (err) {
      setActionError(err.message || 'Unable to delete this tour.');
    } finally {
      setDeletingId('');
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('Are you sure you want to delete ALL tours?')) {
      return;
    }
    setActionError('');
    setActionSuccess('');
    setDeletingAll(true);
    try {
      await deleteAllTours();
      setTours([]);
      setResultCount(0);
      setActionSuccess('All tours deleted.');
      cancelEdit();
    } catch (err) {
      setActionError(err.message || 'Unable to delete all tours.');
    } finally {
      setDeletingAll(false);
    }
  }

  const hasPrevious = page > 1;
  const hasNext = resultCount >= LIST_LIMIT;

  async function handleBookingStatus(bookingId, status) {
    if (!BOOKING_STATUSES.includes(status)) {
      return;
    }
    setBookingActionError('');
    setBookingActionSuccess('');
    setUpdatingBookingId(bookingId);
    try {
      await updateBookingStatus(bookingId, status);
      setBookingActionSuccess('Booking status updated.');
      await loadBookings();
    } catch (err) {
      setBookingActionError(err.message || 'Unable to update booking status.');
    } finally {
      setUpdatingBookingId('');
    }
  }

  async function handleDeleteBooking(bookingId) {
    if (!window.confirm('Delete this booking? This cannot be undone.')) {
      return;
    }
    setBookingActionError('');
    setBookingActionSuccess('');
    setDeletingBookingId(bookingId);
    try {
      await deleteBooking(bookingId);
      setBookingActionSuccess('Booking deleted.');
      setBookings((current) => current.filter((item) => item._id !== bookingId));
    } catch (err) {
      setBookingActionError(err.message || 'Unable to delete this booking.');
    } finally {
      setDeletingBookingId('');
    }
  }

  return (
    <main className="page page-wide">
      <h1>Staff Dashboard</h1>

      <section className="tour-section">
        <h2>Tour Management</h2>
        <h2>{editingId ? 'Edit tour' : 'Create Tour'}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} />
          </label>
          <label>
            Price
            <input name="price" value={form.price} onChange={handleChange} />
          </label>
          <label>
            Summary
            <textarea name="summary" value={form.summary} onChange={handleChange} />
          </label>
          <label>
            Image cover (URL or filename)
            <input name="imageCover" value={form.imageCover} onChange={handleChange} />
          </label>
          <label>
            Gallery images (comma-separated)
            <input name="imagesText" value={form.imagesText} onChange={handleChange} />
          </label>
          <label>
            Rating
            <input name="rating" value={form.rating} onChange={handleChange} />
          </label>
          <label>
            Average rating
            <input name="ratingAverage" value={form.ratingAverage} onChange={handleChange} />
          </label>
          <p>Start location (longitude, latitude — GeoJSON order)</p>
          <label>
            Start longitude
            <input name="startLng" value={form.startLng} onChange={handleChange} />
          </label>
          <label>
            Start latitude
            <input name="startLat" value={form.startLat} onChange={handleChange} />
          </label>
          <label>
            Start address
            <input name="startAddress" value={form.startAddress} onChange={handleChange} />
          </label>
          <label>
            Start description
            <input
              name="startDescription"
              value={form.startDescription}
              onChange={handleChange}
            />
          </label>
          <p>Optional additional location</p>
          <label>
            Location longitude
            <input name="locLng" value={form.locLng} onChange={handleChange} />
          </label>
          <label>
            Location latitude
            <input name="locLat" value={form.locLat} onChange={handleChange} />
          </label>
          <label>
            Location address
            <input name="locAddress" value={form.locAddress} onChange={handleChange} />
          </label>
          <label>
            Location description
            <input
              name="locDescription"
              value={form.locDescription}
              onChange={handleChange}
            />
          </label>
          <label>
            Guide IDs (comma-separated)
            <input name="guidesText" value={form.guidesText} onChange={handleChange} />
          </label>
          <label>
            Start dates (YYYY-MM-DD, comma-separated)
            <input name="startDatesText" value={form.startDatesText} onChange={handleChange} />
          </label>
          {formError ? <p className="error">{formError}</p> : null}
          {formSuccess ? <p className="success">{formSuccess}</p> : null}
          <button type="submit" disabled={submitting}>
            {submitting ? (editingId ? 'Updating...' : 'Creating...') : editingId ? 'Update tour' : 'Create tour'}
          </button>
          {editingId ? (
            <button type="button" className="secondary-form-button" onClick={cancelEdit}>
              Cancel edit
            </button>
          ) : null}
        </form>
      </section>

      <section className="tour-section">
        <h2>Existing Tours</h2>
        {actionError ? <p className="error">{actionError}</p> : null}
        {actionSuccess ? <p className="success">{actionSuccess}</p> : null}
        {isAdmin ? (
          <p>
            <button
              type="button"
              className="review-delete"
              disabled={deletingAll}
              onClick={handleDeleteAll}
            >
              {deletingAll ? 'Deleting...' : 'Delete All Tours'}
            </button>
          </p>
        ) : null}
        {listLoading ? <p className="status">Loading tours...</p> : null}
        {listError ? <p className="error">{listError}</p> : null}
        {!listLoading && !listError && tours.length === 0 ? <p>No tours found.</p> : null}
        {tours.length > 0 ? (
          <div className="table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Average</th>
                  <th>Summary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr key={tour._id}>
                    <td>{tour.name || '—'}</td>
                    <td>{tour.price != null ? `$${tour.price}` : '—'}</td>
                    <td>{tour.rating != null ? tour.rating : '—'}</td>
                    <td>{tour.ratingAverage != null ? tour.ratingAverage : '—'}</td>
                    <td>{tour.summary || '—'}</td>
                    <td>
                      <div className="management-actions">
                        <button type="button" onClick={() => startEdit(tour._id)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="review-delete"
                          disabled={deletingId === tour._id}
                          onClick={() => handleDelete(tour._id)}
                        >
                          {deletingId === tour._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div className="pagination">
          <button
            type="button"
            disabled={!hasPrevious || listLoading}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            type="button"
            disabled={!hasNext || listLoading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </section>

      <section className="tour-section">
        <h2>Booking Management</h2>
        {bookingActionError ? <p className="error">{bookingActionError}</p> : null}
        {bookingActionSuccess ? <p className="success">{bookingActionSuccess}</p> : null}
        {bookingsLoading ? <p className="status">Loading bookings...</p> : null}
        {bookingsError ? <p className="error">{bookingsError}</p> : null}
        {!bookingsLoading && !bookingsError && bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : null}
        {bookings.length > 0 ? (
          <div className="table-wrap">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Booked</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{nestedName(booking.tour)}</td>
                    <td>{nestedName(booking.user)}</td>
                    <td>{nestedEmail(booking.user)}</td>
                    <td>{booking.price != null ? `$${booking.price}` : '—'}</td>
                    <td>
                      <select
                        value={BOOKING_STATUSES.includes(booking.status) ? booking.status : 'pending'}
                        disabled={updatingBookingId === booking._id}
                        onChange={(event) => handleBookingStatus(booking._id, event.target.value)}
                      >
                        {BOOKING_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{booking.paymentStatus || '—'}</td>
                    <td>{booking.createdAt ? formatWhen(booking.createdAt) : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="review-delete"
                        disabled={deletingBookingId === booking._id}
                        onClick={() => handleDeleteBooking(booking._id)}
                      >
                        {deletingBookingId === booking._id ? 'Deleting...' : 'Delete Booking'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
