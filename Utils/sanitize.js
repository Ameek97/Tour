function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stripOperatorKeys(value) {
  if (Array.isArray(value)) {
    return value.map(stripOperatorKeys);
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const cleaned = {};
  Object.keys(value).forEach(key => {
    if (!key || key.startsWith('$') || key.includes('.')) {
      return;
    }
    cleaned[key] = stripOperatorKeys(value[key]);
  });
  return cleaned;
}

function bookingForClient(booking) {
  if (!booking) {
    return booking;
  }
  const data = typeof booking.toObject === 'function' ? booking.toObject() : { ...booking };
  delete data.razorpaySignature;
  return data;
}

exports.stripOperatorKeys = stripOperatorKeys;
exports.bookingForClient = bookingForClient;
