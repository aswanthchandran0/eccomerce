
var express = require('express');
var router = express.Router();
const nodemailer= require('nodemailer')
const { isValidFname,isValidEmail,isValidPhoneNumber,isValidPassword,isPasswordMatch}= require('../validators/userValidators')
const crypto = require('crypto');
const User = require('../models/userModel'); 
const userController = require('../controller/userController')


router.get('/', function(req, res, next) {
    res.render('login', { title: 'Express',errors:{} });
  });


router.post('/login',userController.loginController)
router.post('/signin', userController.signUp);



module.exports = router;