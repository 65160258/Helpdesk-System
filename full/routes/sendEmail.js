const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'dameon.collier20@ethereal.email',
        pass: 'Y6NAhNwmBt4c1k8Ys5'
    }
});

// Function to send email
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: 'dameon.collier20@ethereal.email', // Sender address
        to, 
        subject, 
        text, 
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return reject(error);
            }
            console.log('Email sent: ' + info.response);
            resolve(info);
        });
    });
};

module.exports = sendEmail;
