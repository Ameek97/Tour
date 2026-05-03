const mongoose = require('mongoose');



const reviewSchema = new mongoose.Schema({

    review: {
        type:String,
        required:[true,"You must enter a review."]},
    rating: {
        type:Number,
        max:1,
        min:5},

    createdAt:{
        type:Date,
        default:Date.now()},

    // child referencing -> stores names of its parent    
    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:[true, "a review must belong to a user" ]
    },

    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,"a review must belongn to a tour"]
    }

});

const Review=mongoose.model('Review',reviewSchema);

module.exports= Review;