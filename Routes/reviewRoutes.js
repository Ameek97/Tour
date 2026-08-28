const express= require(`express`);
const authController=require(`./../Controller/authController`);
const reviewController=require('./../Controller/reviewController');

const Router= express.Router({mergeParams:true}); // so the router would have access to the url(params) passed to the route before

Router
     .route(`/`)
     .post(authController.protect, authController.restrictTo(`user`), reviewController.postReview)
     .get(reviewController.getReviews)

Router 
     .route('/:id')
     .delete(authController.protect, authController.restrictTo(`user`, `admin`), reviewController.deleteReview);


module.exports=Router     

