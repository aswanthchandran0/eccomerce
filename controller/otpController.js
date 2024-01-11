const { isValidOtp } = require('../validators/userValidators');
const otpGenerator = require('./otpGenerator')
const crypto = require('crypto');
const userModel = require('../models/userModel')

const otp_Expire_Duration = 3 * 60 * 1000
async function validateOtp(req, res) {
  const { otp } = req.body;
  const user = await userModel.findById(req.session.user._id)
  const otpTimeStamb = user.otpTimeStamb
  console.log('otp time statmp',otpTimeStamb);
  const currentTimestamb = Date.now();
         const userId = req.session.user._id
  if (currentTimestamb - otpTimeStamb > otp_Expire_Duration) {
    res.render('otp', { title: 'otp', otpError: 'OTP has expired. Please request a new OTP.' });
    return;
  }
       
    

  const generatedOtp =user.otp
  try {
    const isValid = await isValidOtp(parseInt(otp), parseInt(generatedOtp));
    if (!isValid) {
      res.render('otp', { title: 'otp', otpError: 'Invalid OTP' });
    } else {
      const verified = await userModel.findByIdAndUpdate(userId, {Authentication:'verified',otpTimeStamb:null})
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const resendOtp = async (req,res)=>{

  const userId = req.session.user._id
  const user = await userModel.findById(userId)
  const email = user.Email
  console.log('user email'+email);

  const resendOtpGenerated = crypto.randomInt(100000,999999)
  const resendOtpTimestamb = Date.now()
   console.log('resend otp',resendOtpGenerated);
  const  userUpdated = await userModel.findByIdAndUpdate(userId,{otp:resendOtpGenerated,otpTimeStamb:resendOtpTimestamb})
   userUpdated.save()
  
 
  try{
    await otpGenerator.sendOtpEmail(email,resendOtpGenerated)
  }catch(error){
    console.error(error);
        res.status(500).send('Internal Server Error');
  }

}

module.exports = {
  validateOtp,resendOtp
};
