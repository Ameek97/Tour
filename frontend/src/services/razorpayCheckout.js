export function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Payment checkout is not available.'));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () =>
        reject(new Error('Unable to load payment checkout.'))
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Unable to load payment checkout.'));
    document.body.appendChild(script);
  });
}

export function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency,
  description,
  name,
  email
}) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Payment checkout is not available.'));
      return;
    }
    if (!keyId || !orderId) {
      reject(new Error('Payment order is incomplete.'));
      return;
    }

    const checkout = new window.Razorpay({
      key: keyId,
      amount,
      currency: currency || 'INR',
      order_id: orderId,
      name: 'Natours',
      description: description || 'Tour booking',
      prefill: {
        name: name || '',
        email: email || ''
      },
      handler(response) {
        resolve(response);
      },
      modal: {
        ondismiss() {
          const error = new Error(
            'Payment was cancelled. Your booking is still unpaid until payment is completed.'
          );
          error.code = 'CHECKOUT_DISMISSED';
          reject(error);
        }
      }
    });

    checkout.on('payment.failed', response => {
      const description =
        response && response.error && response.error.description
          ? response.error.description
          : 'Payment failed.';
      const error = new Error(description);
      error.code = 'PAYMENT_FAILED';
      reject(error);
    });

    checkout.open();
  });
}
