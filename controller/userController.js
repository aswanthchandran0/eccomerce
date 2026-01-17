const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { isValidFname, isValidEmail, isValidPhoneNumber, isValidPassword, isPasswordMatch, isValidOtp } = require('../validators/userValidators')
const crypto = require('crypto');
const otpGenerator = require('./otpGenerator')
const { log, error } = require('console');

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ CREATE USER +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const createUser = async(Fname, Email, PhoneNumber, Password, otp,otpTimestamb) => {
  try {
    const hashedPassword = await bcrypt.hash(Password, 10)
    const referalCode = generateRandomReferalCode();
    const newUser = new User({
      Fname,
      Email,
      PhoneNumber,
      Password: hashedPassword,
      referalCode,
      otp,
      otpTimeStamb:otpTimestamb
    });
    console.log(newUser);
    await newUser.save();
    return newUser
  } catch (error) {
    throw error;
  }
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ LOGIN +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const loginController = async (req, res) => {
  try { 
    const { Email, Password } = req.body;
    
    if(Email && Email.trim().length===0){
      const errors = { login: 'Please enter email' };
      return res.render('login', { errors, formData: { Email } });
    }
    
    if(Password && Password.trim().length === 0){
      const errors = { login: 'Please enter Password' };
      return res.render('login', { errors, formData: { Email } });
    }
    
    const user = await User.findOne({ Email: Email })
    
    if (user && user.Authentication === 'verified') {
      const passwordMatch = await bcrypt.compare(Password, user.Password)
      
      if (passwordMatch) {
        if (user.userStatus === 'active') {
          req.session.loggedIn = true
          req.session.user = user;
          return res.redirect('/?login=sucess');
        } else {
          const errors = { login: 'Account is banned. Please contact support.' };
          return res.render('login', { errors, formData: { Email } });
        }
      } else {
        const errors = { login: 'Invalid email or password.' };
        return res.render('login', { errors, formData: { Email } });
      }
    } else {
      const errors = { login: 'User not found. Please check your email or sign up.' };
      return res.render('login', { errors, formData: { Email } });
    }
  } catch (error) {
    console.error(error);
    // Also pass empty formData when there's a server error
    return res.render('login', { 
      errors: { login: 'Internal server error. Please try again.' },
      formData: { Email: req.body.Email || '' }
    });
  }
}


const generateRandomReferalCode = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ SIGNUP +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
async function signUp(req, res) {
  const { Fname, Email, PhoneNumber, Password, Cpassword, enteredReferalCode } = req.body;
  const generatedOtp = crypto.randomInt(100000, 999999);
  const otpTimestamb = Date.now();
  const existingUser = await User.findOne({ Email });
  if (existingUser) {
    if (existingUser.Authentication !== 'verified') {
      await User.findOneAndRemove({ Email: existingUser.Email })
    } else {
      const errors = {
        Email: 'User with this email is already existed'
      };
      return res.render('signup', { errors });
    }
  }

  const errors = {
    Fname: isValidFname(Fname),
    Email: isValidEmail(Email),
    PhoneNumber: isValidPhoneNumber(PhoneNumber),
    Password: isValidPassword(Password),
    Cpassword: isPasswordMatch(Password, Cpassword),
  };
  const hasErrors = Object.values(errors).some(error => error !== null);
  if (hasErrors) {
    return res.render('signup', { errors });
  }

  try {
  
    await otpGenerator.sendOtpEmail(Email, generatedOtp)
    const newUser = await createUser(Fname, Email, PhoneNumber, Password, generatedOtp,otpTimestamb);
    req.session.loggedIn = true
    req.session.user = newUser;

    if (enteredReferalCode) {    
      if (!isNaN(enteredReferalCode)) {
        const referredUser = await User.findOne({ referalCode: enteredReferalCode });
        if (referredUser) {
          newUser.Wallet += 100;
          referredUser.Wallet += 50;
          const creditTransactionNewUser = { status: 'credited', amount: 100, timestamp: new Date() };
          const creditTransactionReferredUser = { status: 'credited', amount: 50, timestamp: new Date() };
          newUser.walletStatus.push(creditTransactionNewUser);
          referredUser.walletStatus.push(creditTransactionReferredUser);
          await newUser.save();
          await referredUser.save();
        } else {
          const errors = {
            enteredReferalCode: 'Invalid referral code'
          };
          return res.render('login', { errors });
        }
      } else {
        const errors = {
          enteredReferalCode: 'Invalid referral code'
        };
        return res.render('signup', { errors });
      }
    }
    res.redirect('/otp');
    return Email;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ FORGOT PASSWORD +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// emailVerfication controller - FIXED
function emailVerfication(req, res) {
  try {
    const error = req.query.error || '';
    const emailValue = req.query.emailValue || ''; // Get emailValue from query params
    
    res.render('emailverification', { 
      error: error, 
      emailValue: emailValue 
    });
  } catch (error) {
    console.log(error);
    res.status(500).render('emailverification', { 
      error: 'An error occurred. Please try again.',
      emailValue: ''
    });
  }
}

// emailverifying controller - FIXED
async function emailverifying(req, res) {
  try {
    const Email = req.body.Email ? req.body.Email.trim() : '';
    let error = '';
    
    if (!Email) {
      error = 'Please enter your email address';
      return res.redirect('/emailverification?error=' + encodeURIComponent(error) + '&emailValue=' + encodeURIComponent(Email));
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      error = 'Please enter a valid email address';
      return res.redirect('/emailverification?error=' + encodeURIComponent(error) + '&emailValue=' + encodeURIComponent(Email));
    }
    
    // Check if user exists
    const existedUser = await User.findOne({ Email: Email });
    if (!existedUser) {
      error = 'No account found with this email address';
      return res.redirect('/emailverification?error=' + encodeURIComponent(error) + '&emailValue=' + encodeURIComponent(Email));
    }
    
    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Save OTP to user
    await User.findByIdAndUpdate(existedUser._id, {
      otp: otp,
      otpExpiry: otpExpiry
    });
    
    // TODO: Send OTP via email (implement your email service)
    // sendOTPEmail(Email, otp);
    console.log(`OTP for ${Email}: ${otp}`); // For testing
    
    // Redirect to password reset page
    res.redirect('/forgotpassword?Email=' + encodeURIComponent(Email));
    
  } catch (error) {
    console.error('Error in emailverifying:', error);
    const Email = req.body.Email || '';
    res.redirect('/emailverification?error=An error occurred. Please try again.&emailValue=' + encodeURIComponent(Email));
  }
}

// forgotPassword controller - FIXED
function forgotPassword(req, res) {
  try {
    const Email = req.query.Email;
    const errors = req.query.errors ? JSON.parse(req.query.errors) : {};
    const otpErr = req.query.otpErr || '';
    
    if (!Email) {
      return res.redirect('/emailverification?error=Please enter your email address');
    }
    
    res.render('forgotPassword', { 
      Email: Email, 
      errors: errors, 
      otpErr: otpErr 
    });
    
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).redirect('/emailverification?error=An error occurred');
  }
}

// changePassword controller - FIXED
// changePassword controller - SIMPLIFIED
async function changePassword(req, res) {
  try {
    const { Email, otp, Password, cPassword } = req.body;
    let otpErr = '';
    const errors = {};
    
    // Find user
    const user = await User.findOne({ Email: Email });
    if (!user) {
      return res.redirect('/emailverification?error=User not found');
    }
    
    // Validate OTP
    if (!otp) {
      otpErr = 'Please enter the OTP';
    } else if (otp.length !== 6) {
      otpErr = 'OTP must be 6 digits';
    } else if (user.otp !== parseInt(otp)) {
      otpErr = 'Invalid OTP';
    } else if (user.otpExpiry && user.otpExpiry < Date.now()) {
      otpErr = 'OTP has expired. Please request a new one.';
    }
    
    // SIMPLIFIED PASSWORD VALIDATION (matching your signup validation)
    if (!Password) {
      errors.Password = 'Please enter a password';
    } else if (Password.trim().length < 6) {
      errors.Password = 'Password must be at least 6 characters long';
    } else if (Password.includes(' ')) {
      errors.Password = 'Password cannot contain spaces';
    }
    
    // Validate confirm password
    if (!cPassword) {
      errors.Cpassword = 'Please confirm your password';
    } else if (Password !== cPassword) {
      errors.Cpassword = 'Passwords do not match';
    }
    
    // Check for errors
    const hasErrors = Object.keys(errors).length > 0 || otpErr;
    
    if (hasErrors) {
      const queryParams = new URLSearchParams({
        Email: Email,
        otpErr: otpErr,
        errors: JSON.stringify(errors)
      });
      return res.redirect('/forgotpassword?' + queryParams.toString());
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    // Update user password and clear OTP
    await User.findOneAndUpdate(
      { Email: Email },
      { 
        Password: hashedPassword,
        otp: null,
        otpExpiry: null
      },
      { new: true }
    );
    
    // Redirect to login with success message
    res.redirect('/login?success=Password reset successfully! Please login with your new password.');
    
  } catch (error) {
    console.error('Error in changePassword:', error);
    const queryParams = new URLSearchParams({
      Email: req.body.Email || '',
      otpErr: 'An error occurred. Please try again.'
    });
    res.redirect('/forgotpassword?' + queryParams.toString());
  }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ RESENT OTP +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const resendOtp = async (req, res) => {
  try {
    // Get email from query or body
    const email = req.query.email || req.body.email;
    
    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }
    
    // Generate new OTP
    const resendOtpGenerated = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    
    // Update user with new OTP and expiry time
    const userUpdated = await User.findOneAndUpdate(
      { Email: email },
      { 
        $set: { 
          otp: resendOtpGenerated,
          otpExpiry: otpExpiry,
          updatedAt: new Date()
        } 
      },
      { new: true }
    );
    
    // Send OTP via email
    try {
      await otpGenerator.sendOtpEmail(email, resendOtpGenerated);
      
      // Log for debugging (remove in production)
      console.log(`📧 OTP resent to ${email}: ${resendOtpGenerated}`);
      console.log(`⏰ OTP expires at: ${new Date(otpExpiry).toLocaleString()}`);
      
    } catch (emailError) {
      console.error('❌ Failed to send OTP email:', emailError);
      
      // Still respond success but log the email failure
      // Or you can choose to return an error if email is critical
      return res.status(200).json({
        success: true,
        message: 'OTP generated but failed to send email. Please contact support.',
        otp: resendOtpGenerated, // Only include in development/testing
        warning: 'Email sending failed'
      });
    }
    
    // Successful response
    return res.status(200).json({
      success: true,
      message: 'New OTP has been sent to your email',
      email: email,
      expiresIn: '10 minutes'
    });
    
  } catch (error) {
    console.error('❌ Error in resendOtp controller:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to resend OTP';
    let statusCode = 500;
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorMessage = 'Database error occurred';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Invalid data provided';
      statusCode = 400;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createUser, loginController, signUp, emailVerfication, emailverifying, forgotPassword, changePassword, resendOtp
}



