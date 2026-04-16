const tourController=require('./../Controller/tourController');
const express = require('express');

const Router=express.Router();

Router
  .route(`/`)
  .get(tourController.getAllTours)
  .post(tourController.postTour)

Router
  .route(`/:id`)  
  .get(tourController.tourByID)

Router
     .route(`/delete/:id`)    
     .delete(tourController.deleteTour)



module.exports=Router  
    