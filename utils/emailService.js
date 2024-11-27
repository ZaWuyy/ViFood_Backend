import dotenv  from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};


export default sendEmail;