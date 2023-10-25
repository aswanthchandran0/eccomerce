const { isValidOtp } = require('../validators/userValidators');
const userController = require('../controller/userController');
const otpGenerator = require('./otpGenerator')
const crypto = require('crypto');

const otp_Expire_Duration = 2 * 60 * 1000
const otpTimestamb = userController.otpGeneratedTime();
async function validateOtp(req, res) {
  const { otp } = req.body;
  const currentTimestamb = Date.now();

  if (currentTimestamb - otpTimestamb > otp_Expire_Duration) {
    res.render('otp', { title: 'otp', otpError: 'OTP has expired. Please request a new OTP.' });
    return;
  }
  const generatedOtp = userController.getGeneratedOtp();
  try {
    const isValid = await isValidOtp(parseInt(otp), parseInt(generatedOtp));
    if (!isValid) {
      res.render('otp', { title: 'otp', otpError: 'Invalid OTP' });
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const resendOtp = async (req,res)=>{
  const { email } = req.params;
  const resendOtpGenerated = crypto.randomInt(100000,999999)
  resendOtpTimestamb = Date.now()

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
