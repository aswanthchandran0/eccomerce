const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aswanthc26@gmail.com',
        pass: 'lpiw eubz vfep btnw'
    }
});

async function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: 'aswanthc26@gmail.com',
        to: email,
        subject: 'Lexxive otp verification',
        text: `your otp for verification is: ${otp}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error(error);
        throw new Error('Error sending emails');
    }
}

module.exports = {
    sendOtpEmail
};
