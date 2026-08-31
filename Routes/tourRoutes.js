const tourController=require('./../Controller/tourController');
const express = require('express');
const authController=require(`./../Controller/authController`);
const reviewRouter=require('./../Routes/reviewRoutes');
const {uploadTourImages}= require('./../Utils/upload');

const Router=express.Router();

Router.use(`/:tourId/reviews`,reviewRouter); // get/post.. review on some tour

Router
  .route(`/`)
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect,authController.restrictTo("admin","lead guide"),tourController.postTour)

Router.get('/tour-stats', tourController.getTourStats);

Router.get('/top-5-cheap', tourController.aliasTopCheapTours, tourController.getAllTours);

Router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin','lead guide','guide'),
  tourController.getMonthlyPlan
);

Router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  authController.protect,
  tourController.getToursWithin
);

Router.get(
  '/distances/:latlng/unit/:unit',
  authController.protect,
  tourController.getDistances
);

Router
  .route(`/:id/images`)
  .patch(
    authController.protect,
    authController.restrictTo("admin","lead guide"),
    uploadTourImages,
    tourController.updateTourImages
  )

Router
  .route(`/:id`)  
  .get(tourController.tourByID)
  .patch(authController.protect,authController.restrictTo("admin","lead guide"),tourController.updateTour)

Router
     .route(`/delete/:id`)    
     .delete(authController.protect,authController.restrictTo("admin","lead guide"),tourController.deleteTour)

Router.delete('/delete',authController.protect,authController.restrictTo(`admin`),tourController.deleteAllTours); 
     
     
module.exports=Router  
    