const express = require('express');
const User = require('../model/userModel');
const authController = require('../Controller/authController');
const userController = require(`../Controller/userController`);

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login',authController.login);
router.post('/forgotPassword',authController.forgotPassword);

 router.patch('/resetPassword/:token',authController.resetPassword);

router 
  .route('/')
  .get(userController.getAllUsers);


module.exports = router;