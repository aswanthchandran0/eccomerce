const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'sayooj2525@gmail.com',
        pass: 'sbsf gwxc ehet lkdx'
    }
});

async function sendOtpEmail(email, otp) {
    const mailOptions = {
        from: 'aswanthc26@gmail.com',
        to: email,
        subject: 'Lexxive otp verification',
        text: `your otp for verification is: ${otp} it will expire after 3 minutes`
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
