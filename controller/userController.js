const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer= require('nodemailer')
const { isValidFname,isValidEmail,isValidPhoneNumber,isValidPassword,isPasswordMatch}= require('../validators/userValidators')
const crypto = require('crypto');
const otpGenerator = require('./otpGenerator')

    let generatedOtp 
    let otpTimestamb
  const createUser =  async(Fname, Email, PhoneNumber, Password) => {
       
    try {
     
      const hashedPassword = await bcrypt.hash(Password, 10)
      const newUser = new User({
        Fname,
        Email,
        PhoneNumber,
        Password:hashedPassword, 
      });
      await newUser.save();
      return newUser
    } catch (error) {
      throw error;
    }
  }

   const loginController = async(req,res) =>{
    try {
      const { Email, Password } = req.body;
      const user = await User.findOne({Email:Email, Password:Password})
      if (user) {
        if (user.userStatus === 'active') {
          req.session.user = user; 
            return res.redirect('/');
        } else {
            const errors = { login: 'Account is banned. Please contact support.' };
            return res.render('login', { errors });
        }
    } else {
        const errors = { login: 'Invalid email or password.' };
        return res.render('login', { errors });
    } 
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
   }

   async function signUp(req, res) {
    const { Fname, Email, PhoneNumber, Password, Cpassword } = req.body;
     generatedOtp = crypto.randomInt(100000, 999999);
     otpTimestamb = Date.now();
    const existingUser = await User.findOne({ Email });

    if (existingUser) {
        const errors = {
            Email: 'User with this email is already existed'
        };
        return res.render('login', { errors });
    }

    // Example validation
    const errors = {
        Fname: isValidFname(Fname),
        Email: isValidEmail(Email),
        PhoneNumber: isValidPhoneNumber(PhoneNumber),
        Password: isValidPassword(Password),
        Cpassword: isPasswordMatch(Password, Cpassword),
    };

    const hasErrors = Object.values(errors).some(error => error !== null);

    if (hasErrors) {
        // Validation failed, render the login template with error messages
        return res.render('login', { errors });
    }

    // If validation passes, create a new user and send OTP
   
   
    try {
        await otpGenerator.sendOtpEmail(Email,generatedOtp)
        const hashedPassword = await bcrypt.hash(Password, 10);
        const newUser = await User.create({ Fname, Email, PhoneNumber, Password });
        req.session.user = newUser;
        res.redirect('/otp');
        return Email;
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


function getGeneratedOtp() {
  return generatedOtp; 
}
function otpGeneratedTime(){
   return otpTimestamb
}







  module.exports = {
    createUser,loginController,signUp,getGeneratedOtp,otpGeneratedTime
  } 


