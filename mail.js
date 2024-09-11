require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, otp) {
  try {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: ` <${process.env.EMAIL_USER}>`, // sender address
      to: email, // list of receivers
      subject: "EMAIL VERIFICATION", // Subject line
      text: "You are successfully registered", // plain text body
      html: `<b>You are successfully registered</b>
      your otp is ${otp}`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;
