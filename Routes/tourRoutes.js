const tourController=require('./../Controller/tourController');
const express = require('express');
const authController=require(`./../Controller/authController`);
const reviewController=require('./../Controller/reviewController');
const reviewRouter=require('./../Routes/reviewRoutes');

const Router=express.Router();

Router.use(`/:tour/review`,reviewRouter); // get/post.. review on some tour

Router
  .route(`/`)
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.postTour)

Router
  .route(`/:id`)  
  .get(tourController.tourByID)

Router
     .route(`/delete/:id`)    
     .delete(authController.protect,authController.restrictTo("admin","lead guide"),tourController.deleteTour)

Router.delete('/delete',authController.protect,authController.restrictTo(`admin`),tourController.deleteAllTours);

Router 
     .route(`/:id/review`)
     .post(authController.protect, authController.restrictTo(`user`),reviewController.postReview) 
     .get(authController.protect,reviewController.getReviews); 
     
module.exports=Router  
    