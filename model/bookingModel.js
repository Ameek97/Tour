const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A booking must belong to a user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'A booking must belong to a tour']
    },
    price: {
        type: Number,
        required: [true, 'A booking must have a price']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, {
    timestamps: true
});

bookingSchema.index(
    { user: 1, tour: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

bookingSchema.pre(/^find/, function(){
    this.populate({
        path: 'tour',
        select: 'name price imageCover summary startDates'
    }).populate({
        path: 'user',
        select: 'name email'
    });
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
