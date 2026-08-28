const express = require('express');
const authController = require('../Controller/authController');
const bookingController = require('../Controller/bookingController');

const router = express.Router();

router.use(authController.protect);

router.post('/verify-payment', bookingController.verifyPayment);
router.get('/my-bookings', bookingController.getMyBookings);

router
  .route('/')
  .get(
    authController.restrictTo('admin', 'lead guide'),
    bookingController.getAllBookings
  )
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(
    authController.restrictTo('admin', 'lead guide'),
    bookingController.updateBooking
  )
  .delete(
    authController.restrictTo('admin', 'lead guide'),
    bookingController.deleteBooking
  );

module.exports = router;
