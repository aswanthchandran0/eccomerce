const User = require('../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer= require('nodemailer')
const { isValidFname,isValidEmail,isValidPhoneNumber,isValidPassword,isPasswordMatch}= require('../validators/userValidators')
const crypto = require('crypto');
const otpGenerator = require('./otpGenerator')
const { log } = require('console');

    let generatedOtp 
    let otpTimestamb
  const createUser =  async(Fname, Email, PhoneNumber, Password,otp) => {
       console.log('otp',otp);
    try {
      const hashedPassword = await bcrypt.hash(Password, 10)
      const referalCode = generateRandomReferalCode();
      const newUser = new User({
        Fname,
        Email,
        PhoneNumber,
        Password:hashedPassword, 
        referalCode,
        otp
      });
      console.log(newUser);
      await newUser.save();
      return newUser
    } catch (error) {
      throw error;
    }
  }

   const loginController = async(req,res) =>{
    try {
      const { Email, Password } = req.body;
      const user = await User.findOne({Email:Email})
          
      if (user && user.Authentication === 'verified') {

      const passwordMatch = await bcrypt.compare(Password, user.Password)

      if(passwordMatch){
        if (user.userStatus === 'active') {
          req.session.loggedIn = true
          req.session.user = user; 
        
            return res.redirect('/?login=sucess');
        } else {
            const errors = { login: 'Account is banned. Please contact support.' };
            return res.render('login', { errors });
        }
      }else{
        const errors = { login: 'Invalid email or password.' };
        return res.render('login', { errors });
      }
        
    } else {
        const errors = { login: 'please enter the email' };
        return res.render('login', { errors });
    } 
    } catch(error){
      console.error(error);
      return res.status(500).json({ message: 'Internal server error.' });
    }
   }

   const generateRandomReferalCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

   async function signUp(req, res) {
    const { Fname, Email, PhoneNumber, Password, Cpassword,enteredReferalCode } = req.body;
     generatedOtp = crypto.randomInt(100000, 999999);
     otpTimestamb = Date.now();
    const existingUser = await User.findOne({ Email });
    if(existingUser){
      if(existingUser.Authentication !== 'verified'){
        await User.findOneAndRemove({Email:existingUser.Email})
      }else{
        const errors = {
          Email: 'User with this email is already existed'
      };
      return res.render('signup', { errors });
      }
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
        return res.render('signup', { errors });
    }

    // If validation passes, create a new user and send OTP
    
   
    try {
        await otpGenerator.sendOtpEmail(Email,generatedOtp)
     
        const newUser = await createUser( Fname, Email, PhoneNumber, Password,generatedOtp);
        req.session.loggedIn = true
        req.session.user = newUser;

        if (enteredReferalCode) {
          // Check if enteredReferalCode is a valid number
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


function getGeneratedOtp() {
  return generatedOtp; 
}
function otpGeneratedTime(){
   return otpTimestamb
}







  module.exports = {
    createUser,loginController,signUp,getGeneratedOtp,otpGeneratedTime
  } 



