const express= require(`express`);
const authController=require(`./../Controller/authController`);
const reviewController=require('./../Controller/reviewController');

const Router= express.Router({mergeParams:true}); // so the router would have access to the url(params) passed to the route before

Router
     .route(`/`)
     .post(authController.protect, reviewController.postReview)
     .get(reviewController.getReviews)

Router 
     .route('/:id')
     .get(authController.protect, reviewController.getReview)
     .patch(authController.protect, reviewController.updateReview)
     .delete(authController.protect, reviewController.deleteReview);


module.exports=Router     
