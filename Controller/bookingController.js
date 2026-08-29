const Booking = require('../model/bookingModel');
const Tour = require('../model/tourModel');
const AppError = require('../appError');
const handlerFactory = require('./handlerFactory');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../Utils/razorpay');

const getBookingOwnerId = booking => {
  if (booking.user && booking.user._id) { return booking.user._id.toString(); }
  return booking.user.toString();
};

const isDevelopmentEnv = () =>
  String(process.env.NODE_ENV || '').trim() === 'development';

exports.createBooking = async (req, res, next) => {
  try {
    if (!req.body || !req.body.tour) {
      return next(new AppError('Please provide a tour', 400));
    }

    const tour = await Tour.findById(req.body.tour);
    if (!tour) {
      return next(new AppError('no document with such id was found', 404));
    }

    const amountPaise = Math.round(Number(tour.price) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
      return next(new AppError('Tour does not have a valid price', 400));
    }

    // Development-only: skip Razorpay so bookings can be stored and listed.
    // Production continues to create a Razorpay order before Booking.create.
    if (isDevelopmentEnv()) {
      const createdDev = await Booking.create({
        user: req.user.id,
        tour: tour._id,
        price: tour.price,
        status: 'confirmed',
        paymentStatus: 'pending'
      });

      const bookingDev = await Booking.findById(createdDev._id);

      return res.status(200).json({
        status: 'success',
        data: {
          booking: bookingDev
        }
      });
    }

    let order;
    try {
      order = await createRazorpayOrder({
        amount: amountPaise,
        currency: 'INR',
        receipt: `bk_${Date.now()}`.slice(0, 40),
        notes: {
          tour: String(tour._id),
          user: String(req.user.id)
        }
      });
    } catch (err) {
      return next(new AppError('Unable to create payment order', 500));
    }

    const created = await Booking.create({
      user: req.user.id,
      tour: tour._id,
      price: tour.price,
      status: 'pending',
      paymentStatus: 'pending',
      razorpayOrderId: order.id
    });

    const booking = await Booking.findById(created._id);

    res.status(200).json({
      status: 'success',
      data: {
        booking,
        razorpay: {
          keyId: process.env.RAZORPAY_KEY_ID,
          orderId: order.id,
          amount: order.amount,
          currency: order.currency
        }
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return next(new AppError('You already have a booking for this tour', 400));
    }
    return next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const orderId = req.body && req.body.razorpay_order_id;
    const paymentId = req.body && req.body.razorpay_payment_id;
    const signature = req.body && req.body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return next(new AppError('Please provide razorpay_order_id, razorpay_payment_id and razorpay_signature', 400));
    }

    const booking = await Booking.findOne({
      razorpayOrderId: orderId,
      user: req.user.id
    });

    if (!booking) {
      return next(new AppError('no document with such id was found', 404));
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(200).json({
        status: 'success',
        data: { booking }
      });
    }

    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) {
      return next(new AppError('Payment verification failed', 400));
    }

    const updated = await Booking.findByIdAndUpdate(
      booking._id,
      {
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paymentStatus: 'paid',
        status: 'confirmed'
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { booking: updated }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      result: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find();

    res.status(200).json({
      status: 'success',
      result: bookings.length,
      data: { bookings }
    });
  } catch (err) {
    return next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError('no document with such id was found', 404));
    }

    const ownerId = getBookingOwnerId(booking);
    const role = req.user.role;
    if (ownerId !== req.user.id && role !== 'admin' && role !== 'lead guide') {
      return next(new AppError('You are not authorised to this.', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateBooking = async (req, res, next) => {
  try {
    if (!req.body || req.body.status === undefined) {
      return next(new AppError('Please provide a booking status', 400));
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return next(new AppError('no document with such id was found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteBooking = handlerFactory.deleteOne(Booking);
