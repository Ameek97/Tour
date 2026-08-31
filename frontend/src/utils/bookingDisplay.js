const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  paid: 'Paid',
  failed: 'Failed'
};

export function formatStatusLabel(value) {
  if (!value) {
    return null;
  }
  return STATUS_LABELS[value] || value;
}

export function formatBookingDate(value) {
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

export function httpCover(src) {
  if (src && String(src).startsWith('http')) {
    return src;
  }
  return null;
}

export function bookingTour(booking) {
  if (booking?.tour && typeof booking.tour === 'object') {
    return booking.tour;
  }
  return null;
}

export function bookingUser(booking) {
  if (booking?.user && typeof booking.user === 'object') {
    return booking.user;
  }
  return null;
}
