const express= require(`express`);
const authController=require(`./../Controller/authController`);
const reviewController=require('./../Controller/reviewController');


const Router= express.Router();
Router
     .route(`/`)
     .post(reviewController.postReview)
     .get(reviewController.getReviews)

module.exports=Router     