const express = require('express');
const User = require('../model/userModel');
const userController = require('../Controller/authController');

const router = express.Router();

router.post('/signup', userController.signup);

module.exports = router;