const mongoose = require('mongoose');



const reviewSchema = new mongoose.Schema({

    review: {
        type:String,
        required:[true,"You must enter a review."]},
    rating: {
        type:Number,
        max:5,
        min:1},

    createdAt:{
        select:false,
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

// -- query middleware
reviewSchema.pre(/^find/, function(){

/*----- we dont want to populate the tour,rather just show the id ------*/    
//   this.populate({
//     path:`tour`,
//     select:'name photo'   // we just want to see the name of the tour
//   }).populate({
//     path:`user`,
//     select:'name'   // we just want to see the name of the user 
//   })  ]

    this.populate({
    path:`user`,
    select:'name'   // we just want to see the name of the user 
  })  
});

const Review=mongoose.model('Review',reviewSchema);

module.exports= Review;