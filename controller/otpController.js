const { isValidOtp } = require('../validators/userValidators');
const otpGenerator = require('./otpGenerator')
const crypto = require('crypto');
const userModel = require('../models/userModel')

const OTP_EXPIRE_DURATION = 3 * 60 * 1000; // 3 minutes

async function validateOtp(req, res) {
    try {
        const { otp } = req.body;
        
        // Check if user exists in session
        if (!req.session.user || !req.session.user._id) {
            return res.render('otp', { 
                otpError: 'Session expired. Please sign up again.',
                user: null 
            });
        }

        const user = await userModel.findById(req.session.user._id);
        
        if (!user) {
            return res.render('otp', { 
                otpError: 'User not found. Please sign up again.',
                user: null 
            });
        }

        // Check OTP expiration
        if (user.otpTimeStamb) {
            const currentTime = Date.now();
            const timeDifference = currentTime - user.otpTimeStamb;
            
            if (timeDifference > OTP_EXPIRE_DURATION) {
                return res.render('otp', { 
                    otpError: 'OTP has expired. Please request a new OTP.',
                    user: user 
                });
            }
        }

        // Validate OTP
        const isValid = await isValidOtp(parseInt(otp), parseInt(user.otp));
        
        if (!isValid) {
            return res.render('otp', { 
                otpError: 'Invalid OTP. Please try again.',
                user: user 
            });
        }

        // OTP is valid - update user
        await userModel.findByIdAndUpdate(user._id, {
            Authentication: 'verified',
            otpTimeStamb: null
        });

        // Set session as logged in
        req.session.loggedIn = true;
        
        // Redirect to home or dashboard
        res.redirect('/?verified=true');

    } catch (error) {
        console.error('OTP Validation Error:', error);
        res.status(500).render('otp', { 
            otpError: 'An error occurred. Please try again.',
            user: req.session.user || null 
        });
    }
}

const resendOtp = async (req, res) => {
    try {
        // Check if user exists in session
        if (!req.session.user || !req.session.user._id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Session expired' 
            });
        }

        const userId = req.session.user._id;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        const email = user.Email;
        const resendOtpGenerated = crypto.randomInt(100000, 999999);
        const resendOtpTimestamb = Date.now();

        // Update user with new OTP
        await userModel.findByIdAndUpdate(userId, {
            otp: resendOtpGenerated,
            otpTimeStamb: resendOtpTimestamb
        });

        // Send OTP email
        try {
            await otpGenerator.sendOtpEmail(email, resendOtpGenerated);
            res.json({ 
                success: true, 
                message: 'New OTP sent successfully' 
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP email' 
            });
        }

    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred' 
        });
    }
}

module.exports = {
    validateOtp,
    resendOtp
};