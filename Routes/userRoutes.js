const express = require('express');
const User = require('../model/userModel');
const authController = require('../Controller/authController');
const userController = require(`../Controller/userController`);

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login',authController.login);
router.get('/logout', authController.logout);
router.get('/me', authController.protect, authController.getMe);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.delete('/delete',authController.protect,userController.deleteMe);

router.patch('/updatePassword',authController.protect,authController.updatePassword);
router.patch('/updateMe', authController.protect, userController.updateMe);

router 
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers
  );


module.exports = router;