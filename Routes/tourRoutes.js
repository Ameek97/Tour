const tourController=require('./../Controller/tourController');
const express = require('express');
const authController=require(`./../Controller/authController`);

const Router=express.Router();

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

module.exports=Router  
    