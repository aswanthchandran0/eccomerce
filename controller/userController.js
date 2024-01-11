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
    if(Email.trim().length===0){
      const errors = { login: 'Please enter email' };
      return res.render('login', { errors });
    }
    if(Password.trim().length ===0){
      const errors = { login: 'Please enter Password' };
      return res.render('login', { errors });
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
          return res.render('login', { errors });
        }
      } else {
        const errors = { login: 'Invalid email or password.' };
        return res.render('login', { errors });
      }

    } else {
      const errors = { login: 'user not exist' };
      return res.render('login', { errors });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
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

function emailVerfication(req, res) {
  try {
    const error = req.query.error
   res.render('emailverification', { error: error ? error : '' })
  } catch (error) {
    console.log(error);
    res.status(500)
  }
}

async function emailverifying(req, res) {
  try {
    const Email = req.body.Email
    let error = 'Enter an email'
    if (Email) {
      emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRegex.test(Email)){
        error = 'please enter a valid email address' 
      }else{
        error = 'Email not existing'
      }  
    }
    const existedUser = await User.find({ Email: Email })
    if (existedUser.length > 0) {
      res.redirect('/forgotPassword?Email=' + encodeURIComponent(Email))
    } else {
      console.log('request reaching in the else case');
      res.redirect('/emailverification?error=' + encodeURIComponent(error))
    }
  } catch (error) {
    console.log(error);
    res.status(500)
  }
}

function forgotPassword(req, res) {
  try {
    const Email = req.query.Email
    const errors = null
    const otpErr = null
  if(Email === null || Email === undefined){
    res.redirect('/emailverification')
  }
    res.render('forgotPassword', { Email: Email ? Email : '', errors: errors ? errors : '', otpErr: otpErr ? otpErr : '' })
  } catch (error) {
    console.log(error);
    res.status(500)
  }
}

async function changePassword(req, res) {
  try {
    const { Email, otp, Password, cPassword } = req.body
    const user = await User.find({ Email: Email })
    const generatedOtp = user[0].otp;
    const isValid = await isValidOtp(parseInt(otp), parseInt(generatedOtp));
    console.log('generated otp', generatedOtp);
    console.log('otp', otp);
    console.log('isvalid..', isValid);
    console.log('user', user);
    if (!otp) {
      otpErr = 'Enter otp'
    } else if (!isValid) {
      otpErr = 'invalid otp'
    }
    const errors = {
      Email: isValidEmail(Email),
      Password: isValidPassword(Password),
      Cpassword: isPasswordMatch(Password, cPassword),
    };
    const hasErrors = Object.values(errors).some(error => error !== null);
    console.log('has error', hasErrors);
    if (hasErrors === false && isValid === true) {
      const hashedPassword = await bcrypt.hash(Password, 10)
      await User.findOneAndUpdate(
        { Email: Email },
        { $set: { Password: hashedPassword } },
        { new: true }
      );
      res.redirect('/login')
    }
    if (hasErrors || otpErr) {
      res.render('forgotPassword', { Email: Email ? Email : '', errors: errors ? errors : '', otpErr: otpErr ? otpErr : '' })
    }
  } catch (error) {
    console.log(error);
    res.status(500)
  }
}

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++ RESENT OTP +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const resendOtp = async (req, res) => {
const email = req.query.email
const resendOtpGenerated = crypto.randomInt(100000, 999999)
const userUpdated = await User.findOneAndUpdate(
    { Email: email },
    { $set: { otp: resendOtpGenerated } },
    { new: true }
  );
const resendOtpTimestamb = Date.now();
try {
    await otpGenerator.sendOtpEmail(email, resendOtpGenerated)
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
}


module.exports = {
  createUser, loginController, signUp, emailVerfication, emailverifying, forgotPassword, changePassword, resendOtp
}



