const tourController=require('./../Controller/tourController');
const express = require('express');
const authController=require(`./../Controller/authController`);
const reviewRouter=require('./../Routes/reviewRoutes');

const Router=express.Router();

Router.use(`/:tour/review`,reviewRouter); // get/post.. review on some tour

Router
  .route(`/`)
  .get(authController.protect, tourController.getAllTours)
  .post(authController.protect,authController.restrictTo("admin","lead guide"),tourController.postTour)

Router
  .route(`/:id`)  
  .get(tourController.tourByID)
  .patch(authController.protect,authController.restrictTo("admin","lead guide"),tourController.updateTour)

Router
     .route(`/delete/:id`)    
     .delete(authController.protect,authController.restrictTo("admin","lead guide"),tourController.deleteTour)

Router.delete('/delete',authController.protect,authController.restrictTo(`admin`),tourController.deleteAllTours); 
     
     
module.exports=Router  
    