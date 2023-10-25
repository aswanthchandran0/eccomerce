const express = require('express');
const router = express.Router();
const otpController = require('../controller/otpController');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

/* GET and POST requests for OTP validation */
router.get('/', function (req, res) {
  res.render('otp', { title: 'otp', otpError: null });
});

router.post('/otpValidation', limiter, otpController.validateOtp);
router.post('/resend-otp', otpController.resendOtp)

module.exports = router;
